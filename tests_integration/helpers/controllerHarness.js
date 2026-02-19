import jwt from 'jsonwebtoken';
import { verifyJWT } from '../../app/middlewares/jwtVerify.js';
import { requestId } from '../../app/middlewares/requestId.js';

export function makeAuthToken(payload = {}) {
  return jwt.sign({
    id: 5,
    email: 'integration@test.dev',
    firstname: 'Integration',
    lastname: 'User',
    ...payload,
  }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export function mockReq(overrides = {}) {
  return {
    method: 'GET',
    path: '/api/test',
    headers: { accept: 'application/json' },
    cookies: {},
    params: {},
    query: {},
    body: {},
    app: { get: () => null },
    ...overrides,
  };
}

export function mockRes() {
  const res = {
    statusCode: 200,
    jsonData: null,
    redirectUrl: null,
    view: null,
    locals: {},
    headers: {},
    sent: false,
    clearedCookies: [],
  };

  res.setHeader = (key, value) => {
    res.headers[key] = value;
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.jsonData = data;
    res.sent = true;
    return res;
  };
  res.redirect = (url) => {
    res.redirectUrl = url;
    res.sent = true;
    return res;
  };
  res.render = (view, data) => {
    res.view = { view, data };
    res.sent = true;
    return res;
  };
  res.clearCookie = (name) => {
    res.clearedCookies.push(name);
  };

  return res;
}

export function withRequestId(req, res) {
  requestId(req, res, () => {});
}

export async function invokeProtected(handler, req, res) {
  let nextCalled = false;

  await new Promise((resolve, reject) => {
    verifyJWT(req, res, () => {
      nextCalled = true;
      Promise.resolve(handler(req, res))
        .then(resolve)
        .catch(reject);
    });

    if (!nextCalled) {
      resolve();
    }
  });
}
