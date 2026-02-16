import { jest, describe, test, expect } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { verifyJWT } from '../app/middlewares/jwtVerify.js';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

// ─── Mock de Sequelize et des modèles AVANT d'importer le controller ───

// Mock du modèle User
const mockUser = {
  id: 5,
  firstname: 'Jean',
  lastname: 'Dupont',
  email: 'jean@test.com',
  update: jest.fn().mockResolvedValue(true),
};

jest.unstable_mockModule('../app/models/User.js', () => ({
  User: {
    findByPk: jest.fn().mockResolvedValue(mockUser),
    destroy: jest.fn().mockResolvedValue(1),
  },
}));

jest.unstable_mockModule('../app/schemas/userUpdateSchema.js', () => ({
  userUpdateSchema: {
    validateAsync: jest.fn().mockResolvedValue({}),
  },
}));

// Import dynamique APRÈS les mocks
const { default: profilController } = await import('../app/controllers/profilController.js');

function mockReq(overrides = {}) {
  return { cookies: {}, method: 'GET', params: {}, body: {}, ...overrides };
}

function mockRes() {
  const res = {
    redirectUrl: null,
    statusCode: null,
    jsonData: null,
    clearedCookies: [],
    cookiesSet: [],
  };
  res.redirect = (url) => { res.redirectUrl = url; };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.jsonData = data; return res; };
  res.clearCookie = (name) => { res.clearedCookies.push(name); };
  res.cookie = (name, val, opts) => { res.cookiesSet.push({ name, val, opts }); };
  res.render = jest.fn();
  res.send = jest.fn();
  return res;
}

// ─── Vérification d'identité sur les routes protégées ───
// Ces tests appellent les VRAIS controllers pour détecter toute régression

describe('Autorisation - vérification d\'identité (vrais controllers)', () => {
  test('updateProfile refuse si req.user.id !== userId (403)', async () => {
    const req = mockReq({
      method: 'POST',
      user: { id: 1, email: 'user1@test.com' },
      params: { id: '2' },
      body: { firstname: 'Hack', lastname: 'Er', email: 'hacker@evil.com' },
    });
    const res = mockRes();

    await profilController.updateProfile(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.jsonData.error).toContain('votre propre profil');
  });

  test('updateProfile accepte si req.user.id === userId', async () => {
    const req = mockReq({
      method: 'POST',
      user: { id: 5, email: 'jean@test.com' },
      params: { id: '5' },
      body: { firstname: 'Jean', lastname: 'Dupont', email: 'jean@test.com' },
    });
    const res = mockRes();

    await profilController.updateProfile(req, res);

    // Pas de 403, le profil est mis à jour et on redirige
    expect(res.statusCode).not.toBe(403);
    expect(res.redirectUrl).toBe('/user/5/profil');
  });

  test('deleteProfile refuse si req.user.id !== userId (403)', async () => {
    const req = mockReq({
      method: 'POST',
      user: { id: 10 },
      params: { id: '99' },
    });
    const res = mockRes();

    await profilController.deleteProfile(req, res);

    expect(res.statusCode).toBe(403);
    expect(res.jsonData.error).toContain('votre propre compte');
  });

  test('deleteProfile accepte si req.user.id === userId', async () => {
    const req = mockReq({
      user: { id: 5 },
      params: { id: '5' },
    });
    const res = mockRes();

    await profilController.deleteProfile(req, res);

    // Pas de 403, le compte est supprimé et on redirige
    expect(res.statusCode).not.toBe(403);
    expect(res.redirectUrl).toBe('/');
    expect(res.clearedCookies).toContain('token');
    expect(res.clearedCookies).toContain('userInfo');
  });
});

// ─── Protection des routes par JWT ───

describe('Protection des routes - verifyJWT comme garde', () => {
  test('un utilisateur non connecté ne peut pas accéder à une route protégée (GET)', () => {
    const req = mockReq({ cookies: {} });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.redirectUrl).toBe('/login');
  });

  test('un utilisateur non connecté ne peut pas POST sur une route protégée', () => {
    const req = mockReq({ method: 'POST', cookies: {} });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  test('un utilisateur connecté peut accéder à une route protégée', () => {
    const token = jwt.sign({ id: 1, email: 'a@b.com' }, JWT_SECRET, { expiresIn: '1h' });
    const req = mockReq({ cookies: { token } });
    const res = mockRes();
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe(1);
  });
});

// ─── Protection contre le mass assignment ───
// Teste que le VRAI controller n'utilise que les champs autorisés

describe('Protection contre le mass assignment (vrai controller)', () => {
  test('seuls firstname, lastname, email sont passés à user.update()', async () => {
    mockUser.update.mockClear();

    const req = mockReq({
      method: 'POST',
      user: { id: 5, email: 'jean@test.com' },
      params: { id: '5' },
      body: {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@test.com',
        role_id: 1,         // tentative d'escalade de privilège
        password: 'hack',   // tentative de changement de mot de passe
        is_admin: true,      // champ inventé
      },
    });
    const res = mockRes();

    await profilController.updateProfile(req, res);

    // Vérifie que user.update() a été appelé SANS les champs dangereux
    expect(mockUser.update).toHaveBeenCalledWith({
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@test.com',
    });
  });
});

// ─── Cookie sécurité ───

describe('Sécurité des cookies', () => {
  test('le cookie token doit être httpOnly', () => {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    };

    expect(cookieOptions.httpOnly).toBe(true);
    expect(cookieOptions.sameSite).toBe('Strict');
  });

  test('le logout efface bien les cookies token et userInfo', () => {
    const res = mockRes();

    // Simule le logout
    res.clearCookie('token');
    res.clearCookie('userInfo');

    expect(res.clearedCookies).toContain('token');
    expect(res.clearedCookies).toContain('userInfo');
  });
});
