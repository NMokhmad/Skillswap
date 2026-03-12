# Security Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 8 confirmed vulnerabilities found in the Skillswap backend (C1, H1, H2, M1, M2, M3, L1, L3) as documented in `docs/superpowers/specs/2026-03-12-security-audit-design.md`.

**Architecture:** Each fix is self-contained and touches only the identified files. The H1 fix requires installing one new dependency (`file-type`). All other fixes are pure code changes. Tests follow the existing `jest.unstable_mockModule` ESM pattern used in `tests/`.

**Tech Stack:** Node.js ESM, Express.js, Jest 29, `jsonwebtoken`, `multer`, `sequelize`, `file-type` (new)

---

## Chunk 1: Configuration and Middleware Fixes (C1, M3, L1, L3)

Four independent, low-risk fixes. No new dependencies. Each has its own test.

---

### Task 1: Fix auth rate limiter paths (C1)

**Files:**
- Modify: `app/createApp.js:62-63`
- Create: `tests/createAppRateLimiter.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/createAppRateLimiter.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Must mock these before createApp is imported to avoid DB connections
jest.unstable_mockModule('../app/router.js', () => ({
  default: (await import('express')).Router(),
}));
jest.unstable_mockModule('../app/helpers/sentry.js', () => ({
  captureException: jest.fn(),
}));
jest.unstable_mockModule('../app/middlewares/userInfoCookie.js', () => ({
  userInfo: (req, res, next) => next(),
}));
jest.unstable_mockModule('../app/middlewares/requestLogger.js', () => ({
  requestLogger: (req, res, next) => next(),
}));

// Capture which paths the authLimiter is mounted on
const authLimiterMiddleware = jest.fn((req, res, next) => next());
let rateLimitCallCount = 0;
let authLimiterPaths = [];

jest.unstable_mockModule('express-rate-limit', () => ({
  default: (config) => {
    rateLimitCallCount++;
    // The second call is authLimiter (first is globalLimiter)
    if (rateLimitCallCount === 2) return authLimiterMiddleware;
    return (req, res, next) => next(); // globalLimiter noop
  },
}));

const { createApp } = await import('../app/createApp.js');

describe('C1 — authLimiter applied to API auth routes', () => {
  beforeEach(() => { rateLimitCallCount = 0; });

  test('authLimiter middleware is mounted on /api/auth/login and /api/auth/register', () => {
    const app = createApp();
    const stack = app._router.stack;

    // Find all layers where our authLimiterMiddleware is the handler
    const limiterLayers = stack.filter(layer => layer.handle === authLimiterMiddleware);

    const paths = limiterLayers.map(layer => layer.regexp.toString());

    // /api/auth/login should be covered
    const coversApiLogin = limiterLayers.some(layer =>
      layer.regexp.test('/api/auth/login')
    );
    // /api/auth/register should be covered
    const coversApiRegister = limiterLayers.some(layer =>
      layer.regexp.test('/api/auth/register')
    );
    // Legacy /login (without /api prefix) should NOT be a dedicated limiter target
    const coversLegacyLogin = limiterLayers.some(layer =>
      layer.regexp.test('/login') && !layer.regexp.test('/api/auth/login')
    );

    expect(coversApiLogin).toBe(true);
    expect(coversApiRegister).toBe(true);
    expect(coversLegacyLogin).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /path/to/Skillswap && npm test -- --testPathPattern=createAppRateLimiter
```

Expected: FAIL — `coversApiLogin` is false because current code mounts on `/login`.

- [ ] **Step 3: Apply the fix**

In `app/createApp.js`, change lines 62–63:

```js
// BEFORE:
app.use('/login', authLimiter);
app.use('/register', authLimiter);

// AFTER:
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=createAppRateLimiter
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/createApp.js tests/createAppRateLimiter.test.js
git commit -m "fix(security): apply auth rate limiter to /api/auth routes (C1)

Was mounted on legacy EJS /login and /register paths that no longer
exist after React migration. API endpoints /api/auth/login and
/api/auth/register were completely unprotected from brute force."
```

---

### Task 2: Fix userInfoCookie missing clearCookie (M3)

**Files:**
- Modify: `app/middlewares/userInfoCookie.js:17-19`
- Create: `tests/userInfoCookie.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/userInfoCookie.test.js
import { jest, describe, test, expect } from '@jest/globals';

process.env.JWT_SECRET = 'test-secret';

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn(),
  },
}));

const { default: jwtMock } = await import('jsonwebtoken');
const { userInfo } = await import('../app/middlewares/userInfoCookie.js');

function mockReq(token = null) {
  return { cookies: token ? { token } : {} };
}

function mockRes() {
  const res = { clearedCookies: [], clearedCookieOptions: {} };
  res.clearCookie = (name, opts) => {
    res.clearedCookies.push(name);
    res.clearedCookieOptions = opts || {};
  };
  res.locals = {};
  return res;
}

describe('userInfoCookie', () => {
  test('sets res.locals.user to null and calls next() with no token', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    userInfo(req, res, next);

    expect(res.locals.user).toBeNull();
    expect(next).toHaveBeenCalled();
    expect(res.clearedCookies).toHaveLength(0);
  });

  test('populates res.locals.user with valid token', () => {
    const payload = { id: 1, email: 'a@b.com' };
    jwtMock.verify.mockReturnValueOnce(payload);

    const req = mockReq('valid-token');
    const res = mockRes();
    const next = jest.fn();

    userInfo(req, res, next);

    expect(res.locals.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  test('clears token cookie with correct options when JWT is invalid', () => {
    jwtMock.verify.mockImplementationOnce(() => { throw new Error('invalid'); });

    const req = mockReq('bad-token');
    const res = mockRes();
    const next = jest.fn();

    userInfo(req, res, next);

    expect(res.locals.user).toBeNull();
    expect(res.clearedCookies).toContain('token');
    // Cookie options must match those used when setting the token
    expect(res.clearedCookieOptions).toMatchObject({
      httpOnly: true,
      sameSite: 'Strict',
    });
    expect(next).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=userInfoCookie
```

Expected: FAIL on the third test — `clearedCookies` is empty because clearCookie is never called.

- [ ] **Step 3: Apply the fix**

In `app/middlewares/userInfoCookie.js`, update the catch block:

```js
export const userInfo = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded;
  } catch {
    res.locals.user = null;
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });
  }

  next();
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=userInfoCookie
```

Expected: PASS

- [ ] **Step 5: Add new files to the lint script in `package.json`**

The `lint` script is an explicit file list. Add both new/modified files:

```json
"lint": "eslint ... app/middlewares/userInfoCookie.js tests/createAppRateLimiter.test.js tests/userInfoCookie.test.js"
```

(Append both paths to the existing space-separated list in `package.json:9`.)

Run `npm run lint` and fix any warnings before committing.

- [ ] **Step 6: Commit**

```bash
git add app/middlewares/userInfoCookie.js tests/userInfoCookie.test.js tests/createAppRateLimiter.test.js package.json
git commit -m "fix(security): clear stale JWT cookie on invalid token in userInfoCookie (M3)

jwtVerify.js and optionalJWT already clear the cookie on failure.
userInfoCookie did not, leaving forged/expired tokens in the browser
across all subsequent requests."
```

---

### Task 3: Add startup assertions for JWT_EXPIRES and CORS_ORIGIN (L1, L3)

**Files:**
- Modify: `index.js` (after `await initSentry();`, before `createApp()`)
- Create: `tests/startupAssertions.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// tests/startupAssertions.test.js
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

// We'll extract the assertions into a testable function rather than
// testing index.js directly (index.js starts a server).
// The assertions are extracted to app/helpers/startupChecks.js.
import { assertEnvVars } from '../app/helpers/startupChecks.js';

describe('startupChecks.assertEnvVars', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test('throws if JWT_SECRET is missing', () => {
    delete process.env.JWT_SECRET;
    process.env.JWT_EXPIRES = '7d';
    expect(() => assertEnvVars()).toThrow('JWT_SECRET');
  });

  test('throws if JWT_EXPIRES is missing', () => {
    process.env.JWT_SECRET = 'secret';
    delete process.env.JWT_EXPIRES;
    expect(() => assertEnvVars()).toThrow('JWT_EXPIRES');
  });

  test('throws if CORS_ORIGIN is missing in production', () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRES = '7d';
    process.env.NODE_ENV = 'production';
    delete process.env.CORS_ORIGIN;
    expect(() => assertEnvVars()).toThrow('CORS_ORIGIN');
  });

  test('throws if CORS_ORIGIN is wildcard in production', () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRES = '7d';
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = '*';
    expect(() => assertEnvVars()).toThrow('wildcard');
  });

  test('does not throw in development without CORS_ORIGIN', () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRES = '7d';
    process.env.NODE_ENV = 'development';
    delete process.env.CORS_ORIGIN;
    expect(() => assertEnvVars()).not.toThrow();
  });

  test('does not throw when all vars are set correctly in production', () => {
    process.env.JWT_SECRET = 'secret';
    process.env.JWT_EXPIRES = '7d';
    process.env.NODE_ENV = 'production';
    process.env.CORS_ORIGIN = 'https://skillswap.app';
    expect(() => assertEnvVars()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=startupAssertions
```

Expected: FAIL — `app/helpers/startupChecks.js` does not exist.

- [ ] **Step 3: Create `app/helpers/startupChecks.js`**

```js
// app/helpers/startupChecks.js
export function assertEnvVars() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in environment variables');
  }
  if (!process.env.JWT_EXPIRES) {
    throw new Error('JWT_EXPIRES must be set in environment variables');
  }
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.CORS_ORIGIN) {
      throw new Error('CORS_ORIGIN must be set in production');
    }
    if (process.env.CORS_ORIGIN === '*') {
      throw new Error('CORS_ORIGIN must not be wildcard (*) in production');
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=startupAssertions
```

Expected: PASS

- [ ] **Step 5: Wire `assertEnvVars` into `index.js`**

Add the import and call at the top of `index.js`, after the `dotenv/config` import:

```js
import 'dotenv/config';
import { assertEnvVars } from './app/helpers/startupChecks.js'; // ADD THIS
// ... rest of imports

assertEnvVars(); // ADD THIS — before createApp(), throws on bad config
await initSentry();
const app = createApp();
// ...
```

- [ ] **Step 6: Run all tests to confirm nothing broke**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 7: Add `tests/startupAssertions.test.js` to the lint script in `package.json`**

Append `tests/startupAssertions.test.js` to the explicit file list in the `lint` script. Run `npm run lint` and fix any warnings.

- [ ] **Step 8: Commit**

```bash
git add app/helpers/startupChecks.js index.js tests/startupAssertions.test.js package.json
git commit -m "fix(security): add startup assertions for JWT_EXPIRES and CORS_ORIGIN (L1, L3)

Missing JWT_EXPIRES caused non-expiring tokens. Missing CORS_ORIGIN in
production blocked the real frontend or risked wildcard misconfiguration.
Extracted to startupChecks.js for testability."
```

---

## Chunk 2: Input Validation Fixes (M1, M2, H2)

Three controller-level validation fixes. Use the same `jest.unstable_mockModule` mock pattern as `tests/authLoginSecurity.test.js`.

---

### Task 4: Add message content length check in HTTP endpoint (M1)

**Files:**
- Modify: `app/controllers/messageController.js:294-303`
- Create: `tests/messageContentLength.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/messageContentLength.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const createMock = jest.fn();
const findByPkMock = jest.fn();

jest.unstable_mockModule('../app/models/index.js', () => ({
  User: { findByPk: findByPkMock },
  Message: { create: createMock, findAll: jest.fn(), count: jest.fn() },
}));
jest.unstable_mockModule('../app/helpers/apiResponse.js', () => ({
  sendApiError: jest.fn((res, { status, code, message }) => {
    res.statusCode = status;
    res.jsonData = { error: { code, message } };
    return res;
  }),
  sendApiSuccess: jest.fn((res, data, status = 200) => {
    res.statusCode = status;
    res.jsonData = data;
    return res;
  }),
}));
jest.unstable_mockModule('../app/helpers/logger.js', () => ({
  logger: { error: jest.fn() },
}));
jest.unstable_mockModule('../app/helpers/notificationHelper.js', () => ({
  createNotification: jest.fn(),
}));
jest.unstable_mockModule('../app/sockets/messageHandler.js', () => ({
  emitMessageToParticipants: jest.fn(),
  isUserActiveInConversation: jest.fn().mockReturnValue(false),
  toMessagePayload: jest.fn(),
}));

const { default: messageController } = await import('../app/controllers/messageController.js');

function mockReq(overrides = {}) {
  return {
    user: { id: 1, firstname: 'Alice' },
    params: { userId: '2' },
    body: {},
    app: { get: jest.fn().mockReturnValue(null) },
    ...overrides,
  };
}

function mockRes() {
  return {
    statusCode: null,
    jsonData: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('messageController.apiSendMessage content length', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns 400 when content exceeds 3000 characters', async () => {
    const req = mockReq({ body: { content: 'x'.repeat(3001) } });
    const res = mockRes();

    await messageController.apiSendMessage(req, res);

    expect(res.statusCode).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  test('accepts content of exactly 3000 characters', async () => {
    findByPkMock.mockResolvedValue({ id: 2, firstname: 'Bob' });
    createMock.mockResolvedValue({ id: 99, content: 'x'.repeat(3000), sender_id: 1, receiver_id: 2, is_read: false });

    const req = mockReq({ body: { content: 'x'.repeat(3000) } });
    const res = mockRes();

    await messageController.apiSendMessage(req, res);

    expect(createMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=messageContentLength
```

Expected: FAIL — `Message.create` is called even for 3001-char content.

- [ ] **Step 3: Apply the fix**

In `app/controllers/messageController.js`, in `apiSendMessage`, add a length check after the empty check:

```js
async apiSendMessage(req, res) {
  try {
    const senderId = req.user.id;
    const receiverId = parseInt(req.params.userId);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return sendApiError(res, { status: 400, code: 'BAD_REQUEST', message: 'Le message ne peut pas être vide' });
    }

    // ADD THIS:
    if (content.trim().length > 3000) {
      return sendApiError(res, { status: 400, code: 'CONTENT_TOO_LONG', message: 'Le message ne peut pas dépasser 3000 caractères' });
    }

    // ... rest of function unchanged
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=messageContentLength
```

Expected: PASS

- [ ] **Step 5: Add `tests/messageContentLength.test.js` to the lint script in `package.json`**

Append `tests/messageContentLength.test.js` to the explicit file list in the `lint` script. Run `npm run lint` and fix any warnings.

- [ ] **Step 6: Commit**

```bash
git add app/controllers/messageController.js tests/messageContentLength.test.js package.json
git commit -m "fix(security): enforce 3000 char max on HTTP message endpoint (M1)

Socket.io path already validated this limit. The HTTP POST /api/messages/:userId
endpoint had no max length, allowing unbounded strings to be stored."
```

---

### Task 5: Fix review content length (M2)

**Files:**
- Modify: `app/controllers/reviewController.js:15-51`
- Modify: `app/models/Review.js:16-19`
- Create: `tests/reviewContentLength.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/reviewContentLength.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const findByPkMock = jest.fn();
const findOneMock = jest.fn();
const createMock = jest.fn();

jest.unstable_mockModule('../app/models/index.js', () => ({
  Review: { findOne: findOneMock, create: createMock },
  User: { findByPk: findByPkMock },
  Skill: { findByPk: jest.fn() },
}));
jest.unstable_mockModule('../app/helpers/notificationHelper.js', () => ({
  createNotification: jest.fn(),
}));

const { default: reviewController } = await import('../app/controllers/reviewController.js');
// Capture mock references at top level — must come after all jest.unstable_mockModule calls
const { Skill } = await import('../app/models/index.js');

function mockReq(overrides = {}) {
  return {
    user: { id: 1, firstname: 'Alice' },
    params: { userId: '2' },
    body: { rate: '4', skill_id: '1', content: '' },
    ...overrides,
  };
}

function mockRes() {
  const res = {
    statusCode: null,
    jsonData: null,
    redirectUrl: null,
  };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  res.redirect = (url) => { res.redirectUrl = url; };
  return res;
}

describe('reviewController.createReview content validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Skill.findByPk.mockResolvedValue({ id: 1, label: 'JavaScript' });
    findOneMock.mockResolvedValue(null); // no existing review
    createMock.mockResolvedValue({ id: 10 });
    findByPkMock.mockImplementation(async (id) => {
      if (id === 1) return { id: 1, firstname: 'Alice' };
      if (id === 2) return { id: 2, firstname: 'Bob' };
    });
  });

  test('returns 400 when comment exceeds 500 characters', async () => {
    const req = mockReq({ body: { rate: '4', skill_id: '1', content: 'x'.repeat(501) } });
    const res = mockRes();

    await reviewController.createReview(req, res);

    expect(res.statusCode).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  test('accepts comment of exactly 500 characters', async () => {
    const req = mockReq({ body: { rate: '4', skill_id: '1', content: 'x'.repeat(500) } });
    const res = mockRes();

    await reviewController.createReview(req, res);

    expect(createMock).toHaveBeenCalled();
  });

  test('accepts empty comment', async () => {
    const req = mockReq({ body: { rate: '4', skill_id: '1', content: '' } });
    const res = mockRes();

    await reviewController.createReview(req, res);

    expect(createMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=reviewContentLength
```

Expected: FAIL — `Review.create` is called even for 501-char content.

- [ ] **Step 3: Apply fix in `app/controllers/reviewController.js`**

Add validation after the rate check, before any DB call:

```js
async createReview(req, res) {
  try {
    const reviewedId = parseInt(req.params.userId);
    const reviewerId = req.user.id;

    if (reviewerId === reviewedId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous évaluer vous-même' });
    }

    const { rate, content, skill_id } = req.body;

    if (!rate || !skill_id) {
      return res.status(400).json({ error: 'La note et la compétence sont obligatoires' });
    }

    const parsedRate = parseInt(rate);
    if (parsedRate < 1 || parsedRate > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    // ADD THIS:
    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (trimmedContent.length > 500) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas dépasser 500 caractères' });
    }

    const reviewed = await User.findByPk(reviewedId);
    // ... rest unchanged, but replace content usage:
    // use trimmedContent instead of content || ''
```

Also replace `content: content || ''` and `content: content || ''` in both `existing.update` and `Review.create` calls with `content: trimmedContent`.

Full updated function body:

```js
async createReview(req, res) {
  try {
    const reviewedId = parseInt(req.params.userId);
    const reviewerId = req.user.id;

    if (reviewerId === reviewedId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas vous évaluer vous-même' });
    }

    const { rate, content, skill_id } = req.body;

    if (!rate || !skill_id) {
      return res.status(400).json({ error: 'La note et la compétence sont obligatoires' });
    }

    const parsedRate = parseInt(rate);
    if (parsedRate < 1 || parsedRate > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    const trimmedContent = typeof content === 'string' ? content.trim() : '';
    if (trimmedContent.length > 500) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas dépasser 500 caractères' });
    }

    const reviewed = await User.findByPk(reviewedId);
    if (!reviewed) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    const skill = await Skill.findByPk(parseInt(skill_id));
    if (!skill) {
      return res.status(404).json({ error: 'Compétence introuvable' });
    }

    const existing = await Review.findOne({
      where: { reviewer_id: reviewerId, reviewed_id: reviewedId, skill_id: parseInt(skill_id) }
    });

    if (existing) {
      await existing.update({ rate: parsedRate, content: trimmedContent });
      return res.redirect(`/talents/${reviewedId}`);
    }

    const review = await Review.create({
      rate: parsedRate,
      content: trimmedContent,
      reviewer_id: reviewerId,
      reviewed_id: reviewedId,
      skill_id: parseInt(skill_id)
    });

    const reviewer = await User.findByPk(reviewerId);
    await createNotification({
      userId: reviewedId,
      type: 'review',
      content: `${reviewer.firstname} vous a donné un avis (${parsedRate}/5) en ${skill.label}`,
      relatedEntityType: 'review',
      relatedEntityId: review.id,
      actionUrl: `/talents/${reviewedId}`,
    });

    res.redirect(`/talents/${reviewedId}`);
  } catch (error) {
    console.error('Erreur createReview:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}
```

- [ ] **Step 4: Add Sequelize model validation in `app/models/Review.js`**

```js
content: {
  type: DataTypes.STRING,
  allowNull: false,
  validate: {
    len: [0, 500],
  },
},
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --testPathPattern=reviewContentLength
```

Expected: PASS

- [ ] **Step 6: Add `tests/reviewContentLength.test.js` to the lint script in `package.json`**

Append `tests/reviewContentLength.test.js` to the explicit file list in the `lint` script. Run `npm run lint` and fix any warnings.

- [ ] **Step 7: Commit**

```bash
git add app/controllers/reviewController.js app/models/Review.js tests/reviewContentLength.test.js package.json
git commit -m "fix(security): enforce 500 char max on review content (M2)

DataTypes.STRING maps to VARCHAR(255) — data was already being silently
truncated at 255 chars. Added controller validation (returns 400) and
Sequelize model validation (len: [0, 500]) as defense in depth."
```

---

### Task 6: Fix unrestricted global skill creation (H2)

**Files:**
- Modify: `app/controllers/mainController.js` (both `apiCompleteOnboarding` lines 237-245 and `completeOnboarding` lines 287-300)
- Create: `tests/skillCreation.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/skillCreation.test.js
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

const skillCreateMock = jest.fn();
const skillFindOrCreateMock = jest.fn();
const skillFindAllMock = jest.fn().mockResolvedValue([]);
const userFindByPkMock = jest.fn();
const userUpdateMock = jest.fn();
const findOrCreateJunctionMock = jest.fn();

jest.unstable_mockModule('../app/models/index.js', () => ({
  Skill: {
    create: skillCreateMock,
    findOrCreate: skillFindOrCreateMock,
    findAll: skillFindAllMock,
  },
  User: {
    findByPk: userFindByPkMock,
    update: userUpdateMock,
  },
  Review: {},
}));
jest.unstable_mockModule('../app/database.js', () => ({
  sequelize: {
    fn: jest.fn(),
    col: jest.fn(),
    literal: jest.fn(),
    models: {
      user_has_skill: { findOrCreate: findOrCreateJunctionMock },
    },
  },
}));
jest.unstable_mockModule('../app/helpers/rating.js', () => ({
  addAverageRating: jest.fn(u => u),
}));
jest.unstable_mockModule('../app/helpers/logger.js', () => ({
  logger: { error: jest.fn(), warn: jest.fn() },
}));

const { default: mainController } = await import('../app/controllers/mainController.js');

function mockReq(body = {}) {
  return {
    user: { id: 1 },
    body,
    file: null,
  };
}

function mockRes() {
  const res = { statusCode: null, jsonData: null, redirectUrl: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  res.redirect = (url) => { res.redirectUrl = url; };
  return res;
}

describe('mainController.apiCompleteOnboarding — new_skill validation (H2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userFindByPkMock.mockResolvedValue({ id: 1 });
    userUpdateMock.mockResolvedValue([1]);
    skillFindOrCreateMock.mockResolvedValue([{ id: 99, label: 'Python', slug: 'python' }, true]);
  });

  test('returns 400 when new_skill exceeds 50 characters', async () => {
    const req = mockReq({ new_skill: 'x'.repeat(51) });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(res.statusCode).toBe(400);
    expect(skillCreateMock).not.toHaveBeenCalled();
    expect(skillFindOrCreateMock).not.toHaveBeenCalled();
  });

  test('returns 400 when new_skill contains invalid characters', async () => {
    const req = mockReq({ new_skill: 'Python<script>' });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(res.statusCode).toBe(400);
    expect(skillCreateMock).not.toHaveBeenCalled();
  });

  test('uses findOrCreate by slug to prevent duplicate skills', async () => {
    const req = mockReq({ new_skill: 'Python' });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(skillFindOrCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ slug: 'python' }) })
    );
    expect(skillCreateMock).not.toHaveBeenCalled();
  });

  test('accepts valid skill name within limits', async () => {
    const req = mockReq({ new_skill: 'Node.js' });
    const res = mockRes();

    await mainController.apiCompleteOnboarding(req, res);

    expect(skillFindOrCreateMock).toHaveBeenCalled();
    expect(res.jsonData).toEqual({ success: true });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=skillCreation
```

Expected: FAIL — `Skill.create` is called instead of `findOrCreate`, and no 400 on invalid names.

- [ ] **Step 3: Apply the fix in `app/controllers/mainController.js`**

Extract a shared validation helper and apply it in both `apiCompleteOnboarding` and `completeOnboarding`.

In the `new_skill` block of **`apiCompleteOnboarding`** (lines 237–245), replace:

```js
if (new_skill && new_skill.trim()) {
  const slug = new_skill.trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  await Skill.create({ label: new_skill.trim(), slug, icon: 'fa-lightbulb' });
}
```

With:

```js
if (new_skill && new_skill.trim()) {
  const trimmedSkill = new_skill.trim();

  if (trimmedSkill.length > 50) {
    return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'Le nom de la compétence ne peut pas dépasser 50 caractères' });
  }
  if (!/^[\p{L}0-9 .'-]+$/u.test(trimmedSkill)) {
    return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: 'Le nom de la compétence contient des caractères invalides' });
  }

  const slug = trimmedSkill
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  await Skill.findOrCreate({
    where: { slug },
    defaults: { label: trimmedSkill, slug, icon: 'fa-lightbulb' },
  });
}
```

Apply the **same replacement** to the `new_skill` block in the legacy **`completeOnboarding`** function (lines 287–300), except keep `res.redirect('/')` for the success path (it's not an API route).

For the legacy function, wrap the validation around an early return:
```js
if (new_skill && new_skill.trim()) {
  const trimmedSkill = new_skill.trim();

  if (trimmedSkill.length > 50 || !/^[\p{L}0-9 .'-]+$/u.test(trimmedSkill)) {
    return res.status(400).send('Nom de compétence invalide');
  }

  const slug = trimmedSkill
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  await Skill.findOrCreate({
    where: { slug },
    defaults: { label: trimmedSkill, slug, icon: 'fa-lightbulb' },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=skillCreation
```

Expected: PASS

- [ ] **Step 5: Run all unit tests to confirm no regressions**

```bash
npm test
```

Expected: All PASS

- [ ] **Step 6: Add `tests/skillCreation.test.js` to the lint script in `package.json`**

Append `tests/skillCreation.test.js` to the explicit file list in the `lint` script. Run `npm run lint` and fix any warnings.

- [ ] **Step 7: Commit**

```bash
git add app/controllers/mainController.js tests/skillCreation.test.js package.json
git commit -m "fix(security): validate and deduplicate skill creation (H2)

Any authenticated user could spam the global skills table with arbitrary
strings. Now: max 50 chars, content validated against allowed chars,
findOrCreate by slug prevents duplicates. Applied to both API and legacy
EJS onboarding handlers."
```

---

## Chunk 3: File Upload Hardening (H1)

Requires installing `file-type` (ESM-compatible, no transitive dependencies).

---

### Task 7: Validate file upload magic bytes and sanitize extension (H1)

**Files:**
- Modify: `app/middlewares/upload.js`
- Modify: `app/router.js` (add the new middleware to upload routes)
- Create: `tests/uploadValidation.test.js`

- [ ] **Step 1: Install `file-type`**

```bash
npm install file-type
```

Verify it's added to `package.json` dependencies.

- [ ] **Step 2: Write the failing test**

```js
// tests/uploadValidation.test.js
import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import path from 'path';
import fs from 'fs';
import os from 'os';

// We test the validateAndRenameAvatar middleware that will be exported from upload.js.
// We mock file-type so we don't need real image files.
const fileTypeFromFileMock = jest.fn();

jest.unstable_mockModule('file-type', () => ({
  fileTypeFromFile: fileTypeFromFileMock,
}));

const { validateAndRenameAvatar } = await import('../app/middlewares/upload.js');

function makeTempFile(ext = '.jpg') {
  const tmpDir = os.tmpdir();
  const filePath = path.join(tmpDir, `test-upload-${Date.now()}${ext}`);
  fs.writeFileSync(filePath, 'fake-content');
  return filePath;
}

function mockReq(filePath, ext = '.jpg') {
  return {
    file: filePath ? {
      path: filePath,
      filename: `1-${Date.now()}${ext}`,
    } : null,
    user: { id: 1 },
  };
}

function mockRes() {
  const res = { statusCode: null, jsonData: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  return res;
}

describe('validateAndRenameAvatar middleware (H1)', () => {
  let tmpFile;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (tmpFile && fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  test('calls next() and passes through when no file is uploaded', async () => {
    const req = mockReq(null);
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(fileTypeFromFileMock).not.toHaveBeenCalled();
  });

  test('returns 400 and deletes file when magic bytes are not an allowed image type', async () => {
    tmpFile = makeTempFile('.jpg');
    fileTypeFromFileMock.mockResolvedValue({ mime: 'application/pdf', ext: 'pdf' });

    const req = mockReq(tmpFile, '.jpg');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
    expect(fs.existsSync(tmpFile)).toBe(false); // file deleted
    tmpFile = null;
  });

  test('returns 400 and deletes file when file-type cannot detect type (e.g. SVG without signature)', async () => {
    tmpFile = makeTempFile('.jpg');
    fileTypeFromFileMock.mockResolvedValue(null); // undetectable

    const req = mockReq(tmpFile, '.jpg');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(res.statusCode).toBe(400);
    expect(fs.existsSync(tmpFile)).toBe(false);
    tmpFile = null;
  });

  test('renames file to correct extension based on magic bytes, then calls next()', async () => {
    tmpFile = makeTempFile('.php'); // attacker sent .php extension
    fileTypeFromFileMock.mockResolvedValue({ mime: 'image/jpeg', ext: 'jpg' });

    const req = mockReq(tmpFile, '.php');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(next).toHaveBeenCalled();
    // req.file.filename should now end with .jpg, not .php
    expect(req.file.filename).toMatch(/\.jpg$/);
    // original .php path is gone
    expect(fs.existsSync(tmpFile)).toBe(false);
    // new .jpg path exists
    const newPath = req.file.path;
    expect(fs.existsSync(newPath)).toBe(true);
    // cleanup
    fs.unlinkSync(newPath);
    tmpFile = null;
  });

  test('keeps correct extension when magic bytes match filename extension', async () => {
    tmpFile = makeTempFile('.png');
    fileTypeFromFileMock.mockResolvedValue({ mime: 'image/png', ext: 'png' });

    const req = mockReq(tmpFile, '.png');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.file.filename).toMatch(/\.png$/);
    // cleanup
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    tmpFile = null; // must set to null — afterEach path no longer exists after rename
  });

  test('returns 500 and deletes file when fs.promises.rename throws', async () => {
    tmpFile = makeTempFile('.php'); // wrong extension triggers rename
    fileTypeFromFileMock.mockResolvedValue({ mime: 'image/jpeg', ext: 'jpg' });

    // Spy on fs.promises.rename and make it throw
    const renameSpy = jest.spyOn(fs.promises, 'rename').mockRejectedValueOnce(new Error('EXDEV'));

    const req = mockReq(tmpFile, '.php');
    const res = mockRes();
    const next = jest.fn();

    await validateAndRenameAvatar(req, res, next);

    expect(res.statusCode).toBe(500);
    expect(next).not.toHaveBeenCalled();
    expect(fs.existsSync(tmpFile)).toBe(false); // file deleted in catch
    tmpFile = null;

    renameSpy.mockRestore();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
npm test -- --testPathPattern=uploadValidation
```

Expected: FAIL — `validateAndRenameAvatar` does not exist yet.

- [ ] **Step 4: Add `validateAndRenameAvatar` to `app/middlewares/upload.js`**

Add after the existing `export const uploadAvatar = upload.single('avatar');` line:

```js
import { fileTypeFromFile } from 'file-type';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
};

export async function validateAndRenameAvatar(req, res, next) {
  if (!req.file) return next();

  const filePath = req.file.path;

  try {
    const detected = await fileTypeFromFile(filePath);

    if (!detected || !ALLOWED_MIME_TYPES.has(detected.mime)) {
      await fs.promises.unlink(filePath);
      req.file = null;
      return res.status(400).json({
        status: 400,
        code: 'INVALID_FILE_TYPE',
        message: 'Format non supporté. Utilisez JPG, PNG, GIF ou WebP.',
      });
    }

    const correctExt = MIME_TO_EXT[detected.mime];
    const currentExt = path.extname(req.file.filename).toLowerCase();

    if (currentExt !== correctExt) {
      const newFilename = req.file.filename.slice(0, req.file.filename.lastIndexOf('.')) + correctExt;
      const newPath = path.join(uploadDir, newFilename);
      await fs.promises.rename(filePath, newPath);
      req.file.filename = newFilename;
      req.file.path = newPath;
    }

    next();
  } catch {
    try { await fs.promises.unlink(filePath); } catch {}
    return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
  }
}
```

Note: `fileTypeFromFile` import must be added at the **top** of the file (with the other imports), not inside the function. Move the import statement to the top of `upload.js`.

- [ ] **Step 5: Run test to verify it passes**

```bash
npm test -- --testPathPattern=uploadValidation
```

Expected: PASS

- [ ] **Step 6: Wire `validateAndRenameAvatar` into `app/router.js`**

Import the new middleware and add it after `uploadAvatar` on every upload route:

```js
import { uploadAvatar, validateAndRenameAvatar } from "./middlewares/upload.js";

// ...

// Replace:
router.put("/api/me/profil", verifyJWT, uploadAvatar, profilController.apiUpdateProfile);
router.post("/api/onboarding", verifyJWT, uploadAvatar, mainController.apiCompleteOnboarding);

// With:
router.put("/api/me/profil", verifyJWT, uploadAvatar, validateAndRenameAvatar, profilController.apiUpdateProfile);
router.post("/api/onboarding", verifyJWT, uploadAvatar, validateAndRenameAvatar, mainController.apiCompleteOnboarding);
```

- [ ] **Step 7: Run all tests**

```bash
npm test
```

Expected: All PASS

- [ ] **Step 8: Add `app/middlewares/upload.js` and `tests/uploadValidation.test.js` to the lint script in `package.json`**

Neither file is currently in the explicit lint list. Append both paths. Run `npm run lint` and fix any warnings.

- [ ] **Step 9: Commit**

```bash
git add app/middlewares/upload.js app/router.js tests/uploadValidation.test.js package.json package-lock.json
git commit -m "fix(security): validate file upload magic bytes and sanitize extension (H1)

Multer's fileFilter trusted client-supplied Content-Type — attackable.
Added validateAndRenameAvatar middleware that:
1. Reads actual file magic bytes via file-type library
2. Deletes file and returns 400 if not a recognized image type
3. Renames file to extension derived from magic bytes (not originalname)"
```

---

## Final Verification

- [ ] **Run the full test suite**

```bash
npm test
```

Expected: All tests PASS, no regressions.

- [ ] **Verify the lint script still passes**

```bash
npm run lint
```

Note: If lint fails on new files, add them to the `lint` script in `package.json`.

- [ ] **Final commit if any lint fixes needed**

```bash
git add .
git commit -m "chore: add new test files to lint script"
```
