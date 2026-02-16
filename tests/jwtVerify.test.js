import { jest, describe, test, expect } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { verifyJWT, optionalJWT } from '../app/middlewares/jwtVerify.js';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

function mockReq(overrides = {}) {
  return {
    cookies: {},
    method: 'GET',
    ...overrides,
  };
}

function mockRes() {
  const res = {
    redirectUrl: null,
    statusCode: null,
    jsonData: null,
    clearedCookies: [],
  };
  res.redirect = (url) => { res.redirectUrl = url; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  res.clearCookie = (name) => { res.clearedCookies.push(name); };
  return res;
}

// ─── verifyJWT ───

describe('verifyJWT', () => {
  test('redirige GET vers /login si pas de token', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(res.redirectUrl).toBe('/login');
    expect(next).not.toHaveBeenCalled();
  });

  test('retourne 401 JSON pour POST sans token', () => {
    const req = mockReq({ method: 'POST' });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.jsonData).toEqual({ error: 'Accès non autorisé' });
    expect(next).not.toHaveBeenCalled();
  });

  test('appelle next() et peuple req.user avec un token valide', () => {
    const payload = { id: 1, email: 'test@test.com', firstname: 'John', lastname: 'Doe' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const req = mockReq({ cookies: { token } });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(1);
    expect(req.user.email).toBe('test@test.com');
  });

  test('redirige GET vers /login avec un token invalide et efface les cookies', () => {
    const req = mockReq({ cookies: { token: 'invalid-token' } });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(res.redirectUrl).toBe('/login');
    expect(res.clearedCookies).toContain('token');
    expect(res.clearedCookies).toContain('userInfo');
    expect(next).not.toHaveBeenCalled();
  });

  test('retourne 403 JSON pour POST avec un token invalide', () => {
    const req = mockReq({ method: 'POST', cookies: { token: 'bad-token' } });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.jsonData).toEqual({ error: 'Token invalide ou expiré' });
    expect(res.clearedCookies).toContain('token');
  });

  test('rejette un token expiré', () => {
    const token = jwt.sign({ id: 1 }, JWT_SECRET, { expiresIn: '0s' });
    const req = mockReq({ cookies: { token } });
    const res = mockRes();
    const next = jest.fn();

    // Attendre que le token expire
    verifyJWT(req, res, next);

    expect(res.redirectUrl).toBe('/login');
    expect(next).not.toHaveBeenCalled();
  });

  test('rejette un token signé avec un autre secret', () => {
    const token = jwt.sign({ id: 1 }, 'wrong-secret');
    const req = mockReq({ cookies: { token } });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(res.redirectUrl).toBe('/login');
    expect(res.clearedCookies).toContain('token');
    expect(next).not.toHaveBeenCalled();
  });
});

// ─── optionalJWT ───

describe('optionalJWT', () => {
  test('met req.user à null si pas de token et appelle next()', () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();

    optionalJWT(req, res, next);

    expect(req.user).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  test('peuple req.user avec un token valide et appelle next()', () => {
    const payload = { id: 42, email: 'a@b.com', firstname: 'A', lastname: 'B' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const req = mockReq({ cookies: { token } });
    const res = mockRes();
    const next = jest.fn();

    optionalJWT(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.id).toBe(42);
    expect(next).toHaveBeenCalled();
  });

  test('met req.user à null avec un token invalide, efface les cookies et appelle next()', () => {
    const req = mockReq({ cookies: { token: 'garbage' } });
    const res = mockRes();
    const next = jest.fn();

    optionalJWT(req, res, next);

    expect(req.user).toBeNull();
    expect(res.clearedCookies).toContain('token');
    expect(res.clearedCookies).toContain('userInfo');
    expect(next).toHaveBeenCalled();
  });
});
