# Security Audit — Skillswap
**Date:** 2026-03-12
**Scope:** Backend (Express.js API + Socket.io) + file upload pipeline
**Approach:** Targeted audit of confirmed vulnerabilities + code fixes

---

## Findings

### CRITICAL

#### C1 — Auth rate limiter not applied to API auth routes
**File:** `app/createApp.js:62-63`
**Evidence:**
```js
app.use('/login', authLimiter);
app.use('/register', authLimiter);
```
The active API endpoints are `/api/auth/login` and `/api/auth/register` (`router.js:33-34`). The EJS routes `/login` and `/register` no longer exist after the React migration. The rate limiter protects nothing.

**Risk:** Unlimited brute force attempts on login credentials and automated mass registration.
**Fix:** Replace the two `app.use` calls with `/api/auth/login` and `/api/auth/register`.

---

### HIGH

#### H1 — File upload MIME type relies on client-provided value + extension not sanitized
**File:** `app/middlewares/upload.js:24-31` (fileFilter) and `app/middlewares/upload.js:18` (filename)
**Evidence:**
```js
// fileFilter: checks client-controlled header
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) { // ← client-controlled
    cb(null, true);
  }
};

// filename: preserves originalname extension
const ext = path.extname(file.originalname).toLowerCase(); // ← attacker-controlled
const filename = `${req.user.id}-${Date.now()}${ext}`;
```
`file.mimetype` is the `Content-Type` from the multipart form-data part header — set by the client, not derived from file content. An attacker can send `Content-Type: image/jpeg` while uploading an SVG with embedded `<script>`, bypassing the MIME check.

Additionally, `path.extname(file.originalname)` is attacker-controlled. Sending `originalname: shell.php` with `Content-Type: image/jpeg` produces a file saved as `<userId>-<ts>.php`. If the web server ever executes `.php` files under `public/uploads/`, this is remote code execution.

**Risk:** Stored XSS via a malicious SVG served as a static asset; potential RCE via arbitrary file extension.
**Fix:**
1. Validate actual file content using magic bytes (`file-type` library) after multer saves the file.
2. Delete the file and return 400 if the detected type is not an allowed image type.
3. Rewrite the saved extension from the detected MIME type (e.g., always `.jpg`, `.png`, `.gif`, `.webp`) — never use `file.originalname`'s extension.

#### H2 — Any authenticated user can create global skills without limits or validation
**File:** `app/controllers/mainController.js:237-245`
**Evidence:**
```js
if (new_skill && new_skill.trim()) {
  const slug = new_skill.trim()...;
  await Skill.create({ label: new_skill.trim(), slug, icon: 'fa-lightbulb' });
}
```
No length limit, no content validation, no duplicate check, no rate limit, no admin gating. Any user can call `POST /api/onboarding` repeatedly with arbitrary `new_skill` values — including very long strings.

**Risk:** Skills table pollution; shared dropdown poisoned with junk entries for all users; large strings stored in `label` and `slug` columns.
**Fix:**
1. Validate `new_skill` length (max 50 chars) and content (alphanumeric + spaces, no special chars).
2. Use case-insensitive `findOrCreate` on slug to prevent exact duplicates.
3. Add a per-request guard: reject if the request tries to create more than 1 new skill.

---

### MEDIUM

#### M1 — Message content has no max length in HTTP POST endpoint
**File:** `app/controllers/messageController.js:294-296`
**Evidence:**
```js
if (!content || !content.trim()) {
  return sendApiError(...);
}
// no max length check — Message.create follows immediately
```
The Socket.io path (`messageHandler.js:40`) enforces 3000 chars via `validateSendPayload`. The HTTP POST path `apiSendMessage` does not.

**Risk:** Arbitrarily large strings stored in the `message` table; potential DoS via storage exhaustion.
**Fix:** Add `if (content.trim().length > 3000) return sendApiError(...)` before `Message.create`, matching the socket handler.

#### M2 — Review comment has no max length; DB silently truncates at 255 chars
**File:** `app/controllers/reviewController.js:15,41,50` and `app/models/Review.js`
**Evidence:**
```js
const { rate, content, skill_id } = req.body;
// ...
await existing.update({ rate: parsedRate, content: content || '' });
// or
await Review.create({ ..., content: content || '' });
```
No length constraint on `content` at the controller level. The `Review` model declares `content` as `DataTypes.STRING` (no length argument), which maps to `VARCHAR(255)` in PostgreSQL. The database **silently truncates** any string over 255 characters — no error is thrown, data is already being lost in production.

**Risk:** Silent data truncation occurring now; unbounded input accepted by the API.
**Severity raised to HIGH** given that data corruption is already happening.
**Fix:**
1. Add a controller-level check: `content` max 500 chars (stricter than the DB column, prevents truncation).
2. Add Sequelize model validation: `validate: { len: [0, 500] }` on the `content` field.

#### M3 — `userInfoCookie` does not clear invalid JWT cookies
**File:** `app/middlewares/userInfoCookie.js:17-19`
**Evidence:**
```js
} catch {
  res.locals.user = null;
  // missing: res.clearCookie('token', { httpOnly: true, secure: ..., sameSite: 'Strict' })
}
```
`jwtVerify.js:29` and `optionalJWT:59` both call `res.clearCookie('token')` on decode failure. `userInfoCookie` does not — a stale or forged cookie continues to be sent with every subsequent request.

**Risk:** Invalid token persists in the browser; any future middleware that reads `res.locals.user` without going through `verifyJWT` may behave incorrectly.
**Fix:** Add `res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' })` in the catch block. The cookie options must match those used when setting the cookie (`authController.js:54-58`), otherwise some browsers will not clear it.

---

### LOW

#### L1 — `JWT_EXPIRES` not validated at startup
**File:** `app/controllers/authController.js:51,103,141,176` (all `jwt.sign` calls)
**Evidence:**
```js
jwt.sign({ ... }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES })
```
If `JWT_EXPIRES` is absent from `.env`, `expiresIn` is `undefined` and `jsonwebtoken` issues non-expiring tokens.

**Risk:** Permanent sessions — a stolen or leaked token is valid forever.
**Fix:** In `index.js`, add startup assertions:
```js
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES) {
  throw new Error('JWT_SECRET and JWT_EXPIRES must be set');
}
```

#### L2 — Rate limiter uses in-memory store
**File:** `app/createApp.js:46-63`
**Evidence:** `express-rate-limit` default store (in-memory `Map`).
**Risk:** Rate limit state resets on every server restart; no protection across multiple Node instances.
**Action:** No code change — documented as known limitation. Switch to `rate-limit-redis` before horizontal scaling.

#### L3 — CORS origin defaults to localhost if env var is missing
**File:** `app/createApp.js:71-74`, `index.js:19-23`
**Evidence:**
```js
origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
```
In production without `CORS_ORIGIN`, the real frontend is blocked. If `CORS_ORIGIN=*` is set, credentials would be exposed to all origins.
**Fix:** Add startup assertions in `index.js`:
```js
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CORS_ORIGIN) throw new Error('CORS_ORIGIN must be set in production');
  if (process.env.CORS_ORIGIN === '*') throw new Error('CORS_ORIGIN must not be wildcard in production');
}
```

---

### ARCHITECTURAL NOTE

#### A1 — `POST /review/:userId` is outside the `/api/` prefix
**File:** `app/router.js:58`
**Evidence:**
```js
router.post("/review/:userId", verifyJWT, reviewController.createReview);
```
All other protected routes use `/api/`. This route exists outside the intended API surface, bypassing any monitoring, middleware, or rate limiting scoped to `/api/*`. The route is only used by the legacy EJS form — it should be migrated to `POST /api/review/:userId` as part of the ongoing React migration.
**Action:** Rename to `/api/review/:userId` during the React migration (tracked separately, not fixed here).

---

## Fix Plan

| # | File | Change |
|---|------|--------|
| C1 | `app/createApp.js` | Change `/login` → `/api/auth/login`, `/register` → `/api/auth/register` on authLimiter |
| H1 | `app/middlewares/upload.js` | Add `file-type` magic-byte validation post-write; delete file + return 400 on mismatch; rewrite extension from detected type |
| H2 | `app/controllers/mainController.js` | Validate `new_skill` length (≤50) and content; `findOrCreate` by slug; limit to 1 new skill per request |
| M1 | `app/controllers/messageController.js` | Add `> 3000` length check in `apiSendMessage` |
| M2 | `app/controllers/reviewController.js` + `app/models/Review.js` | Add `> 500` controller check; add Sequelize `validate: { len: [0, 500] }` on model |
| M3 | `app/middlewares/userInfoCookie.js` | Add `res.clearCookie('token', { httpOnly, secure, sameSite })` in catch block |
| L1 | `index.js` | Add startup assertions for `JWT_SECRET` and `JWT_EXPIRES` |
| L2 | — | No code change — document as known limitation (Redis store deferred to scaling phase) |
| L3 | `index.js` | Add startup assertions for `CORS_ORIGIN` in production (not empty, not `*`) |

---

## Out of Scope

- **I1 — No email verification:** Known limitation, no fix in this iteration.
- **A1 — `/review/:userId` prefix:** Tracked for React migration, not fixed here.
- Penetration testing / runtime exploitation
- Frontend (React) security review
- Infrastructure / deployment hardening
