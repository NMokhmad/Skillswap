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
