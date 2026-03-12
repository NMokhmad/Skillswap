import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import express from 'express';

// Must mock these before createApp is imported to avoid DB connections
jest.unstable_mockModule('../app/router.js', () => ({
  default: express.Router(),
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

jest.unstable_mockModule('express-rate-limit', () => ({
  default: () => {
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
