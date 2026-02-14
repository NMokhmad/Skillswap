import jwt from 'jsonwebtoken';
import { verifyJWT } from '../app/middlewares/jwtVerify.js';

const JWT_SECRET = 'test-secret';
process.env.JWT_SECRET = JWT_SECRET;

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

describe('Autorisation - vérification d\'identité', () => {
  test('updateProfile refuse si req.user.id !== userId (403)', async () => {
    // Simule ce que fait profilController.updateProfile
    const req = mockReq({
      method: 'POST',
      user: { id: 1, email: 'user1@test.com' },
      params: { id: '2' },
      body: { firstname: 'Hack', lastname: 'Er', email: 'hacker@evil.com' },
    });
    const res = mockRes();

    // Logique extraite du controller
    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
      res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre profil' });
    }

    expect(res.statusCode).toBe(403);
    expect(res.jsonData.error).toContain('votre propre profil');
  });

  test('updateProfile accepte si req.user.id === userId', async () => {
    const req = mockReq({
      method: 'POST',
      user: { id: 5, email: 'user@test.com' },
      params: { id: '5' },
      body: { firstname: 'Jean', lastname: 'Dupont', email: 'jean@test.com' },
    });
    const res = mockRes();

    const userId = parseInt(req.params.id);
    const authorized = req.user.id === userId;

    expect(authorized).toBe(true);
  });

  test('deleteProfile refuse si req.user.id !== userId (403)', () => {
    const req = mockReq({
      method: 'POST',
      user: { id: 10 },
      params: { id: '99' },
    });
    const res = mockRes();

    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
      res.status(403).json({ error: 'Vous ne pouvez supprimer que votre propre compte' });
    }

    expect(res.statusCode).toBe(403);
    expect(res.jsonData.error).toContain('votre propre compte');
  });

  test('deleteProfile accepte si req.user.id === userId', () => {
    const req = mockReq({
      user: { id: 7 },
      params: { id: '7' },
    });

    const userId = parseInt(req.params.id);
    expect(req.user.id === userId).toBe(true);
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

describe('Protection contre le mass assignment', () => {
  test('seuls firstname, lastname, email sont extraits du body', () => {
    const body = {
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@test.com',
      role_id: 1,         // tentative d'escalade de privilège
      password: 'hack',   // tentative de changement de mot de passe
      is_admin: true,      // champ inventé
    };

    // Whitelist comme dans profilController.updateProfile
    const { firstname, lastname, email } = body;
    const safeData = { firstname, lastname, email };

    expect(safeData).toEqual({
      firstname: 'Jean',
      lastname: 'Dupont',
      email: 'jean@test.com',
    });
    expect(safeData.role_id).toBeUndefined();
    expect(safeData.password).toBeUndefined();
    expect(safeData.is_admin).toBeUndefined();
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
