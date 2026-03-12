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
