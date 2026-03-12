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
The active API endpoints are `/api/auth/login` and `/api/auth/register`. The EJS routes `/login` and `/register` no longer exist after the React migration. The rate limiter protects nothing.

**Risk:** Unlimited brute force attempts on login credentials and automated mass registration.
**Fix:** Replace the two `app.use` calls with `/api/auth/login` and `/api/auth/register`.

---

### HIGH

#### H1 — File upload MIME type relies on client-provided value
**File:** `app/middlewares/upload.js:24-31`
**Evidence:**
```js
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) { // ← client-controlled
    cb(null, true);
  }
};
```
`file.mimetype` is sent by the browser, not derived from the file content. An attacker can upload a `.svg` file containing `<script>` with `Content-Type: image/jpeg` and bypass this check.

**Risk:** Stored XSS via a malicious SVG served as a static asset.
**Fix:** After multer saves the file, read its magic bytes using the `file-type` library and delete + reject if the detected type is not an allowed image type.

#### H2 — Any authenticated user can create global skills without limits
**File:** `app/controllers/mainController.js:237-245`
**Evidence:**
```js
if (new_skill && new_skill.trim()) {
  const slug = ...;
  await Skill.create({ label: new_skill.trim(), slug, icon: 'fa-lightbulb' });
}
```
No duplicate check, no rate limit, no admin gating. Any user can call `POST /api/onboarding` repeatedly with arbitrary `new_skill` values.

**Risk:** Skills table pollution; shared dropdown poisoned with junk entries for all users.
**Fix:**
1. Use case-insensitive `findOrCreate` on slug to prevent exact duplicates.
2. Add a per-user skill-creation rate limit (e.g. max 3 new skills per onboarding call, or a DB count check).

---

### MEDIUM

#### M1 — Message content has no max length in HTTP POST endpoint
**File:** `app/controllers/messageController.js:294-296`
**Evidence:**
```js
if (!content || !content.trim()) {
  return sendApiError(...);
}
// no max length check
```
The Socket.io path (`messageHandler.js:39`) enforces 3000 chars. The HTTP POST path does not.

**Risk:** Arbitrarily large strings stored in the `message` table; potential DoS via storage exhaustion.
**Fix:** Add `if (content.trim().length > 3000) return sendApiError(...)` to match the socket handler.

#### M2 — Review comment has no max length
**File:** `app/controllers/reviewController.js:15,41,50`
**Evidence:**
```js
const { rate, content, skill_id } = req.body;
// ...
await existing.update({ rate: parsedRate, content: content || '' });
// or
await Review.create({ ..., content: content || '' });
```
No length constraint on `content` at the controller level.

**Risk:** Unbounded strings stored in the `review` table.
**Fix:** Add a max 1000 char check on `content` before any DB write.

#### M3 — `userInfoCookie` does not clear invalid JWT cookies
**File:** `app/middlewares/userInfoCookie.js:17-19`
**Evidence:**
```js
} catch {
  res.locals.user = null;
  // missing: res.clearCookie('token')
}
```
`jwtVerify.js` (line 29) and `optionalJWT` (line 59) both call `res.clearCookie('token')` on decode failure. `userInfoCookie` does not, leaving a stale or forged cookie in the browser.

**Risk:** A tampered cookie stays in the browser and may confuse client-side code that reads `res.locals.user` patterns in future.
**Fix:** Add `res.clearCookie('token')` in the catch block.

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
**Fix:** In `index.js` or `createApp.js`, add a startup assertion:
```js
if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES) {
  throw new Error('JWT_SECRET and JWT_EXPIRES must be set');
}
```

#### L2 — Rate limiter uses in-memory store
**File:** `app/createApp.js:46-63`
**Evidence:** `express-rate-limit` default store (in-memory `Map`).
**Risk:** Rate limit state resets on every server restart; no protection across multiple Node instances.
**Note:** Not fixed in code — documented as a known limitation requiring `rate-limit-redis` before horizontal scaling.

#### L3 — CORS origin defaults to localhost if env var is missing
**File:** `app/createApp.js:71-74`, `index.js:19-23`
**Evidence:**
```js
origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
```
In production without `CORS_ORIGIN`, the real frontend is blocked. If someone sets `CORS_ORIGIN=*`, credentials would be exposed to all origins.
**Fix:** Add a startup assertion that `CORS_ORIGIN` is set in `production` and is not `*`.

---

## Fix Plan

| # | File | Change |
|---|------|--------|
| C1 | `app/createApp.js` | Change `/login` → `/api/auth/login`, `/register` → `/api/auth/register` on authLimiter |
| H1 | `app/middlewares/upload.js` | Add `file-type` magic-byte validation after disk write; delete file and return 400 on mismatch |
| H2 | `app/controllers/mainController.js` | Add slug-based `findOrCreate`; add max new-skills-per-request guard (≤3) |
| M1 | `app/controllers/messageController.js` | Add `> 3000` length check in `apiSendMessage` |
| M2 | `app/controllers/reviewController.js` | Add `> 1000` length check on `content` |
| M3 | `app/middlewares/userInfoCookie.js` | Add `res.clearCookie('token')` in catch block |
| L1 | `index.js` | Add startup assertions for `JWT_SECRET` and `JWT_EXPIRES` |
| L3 | `index.js` | Add startup assertion for `CORS_ORIGIN` in production |

---

## Out of Scope

- **I1 — No email verification:** Known limitation, no fix in this iteration.
- **L2 — In-memory rate limiter:** Documented only; Redis store deferred to scaling phase.
- Penetration testing / runtime exploitation
- Frontend (React) security review
- Infrastructure / deployment hardening
