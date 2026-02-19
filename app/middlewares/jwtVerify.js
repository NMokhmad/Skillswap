import jwt from 'jsonwebtoken';
import { isApiRequest, sendApiError } from '../helpers/apiResponse.js';

/**
 * Middleware strict : bloque l'accès si le JWT est absent ou invalide.
 * Pour les routes de pages (GET) → redirige vers /login
 * Pour les routes API (POST/PUT/DELETE) → retourne du JSON 401
 */
export const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;
  const apiRequest = isApiRequest(req);

  if (!token) {
    if (!apiRequest && req.method === 'GET') {
      return res.redirect('/login');
    }
    return sendApiError(res, {
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'Acces non autorise',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.clearCookie('token');
    if (!apiRequest && req.method === 'GET') {
      return res.redirect('/login');
    }
    return sendApiError(res, {
      status: 403,
      code: 'FORBIDDEN',
      message: 'Token invalide ou expire',
    });
  }
};

/**
 * Middleware optionnel : si un JWT valide est présent, on peuple req.user.
 * Sinon, on laisse passer sans bloquer.
 * Utile pour les pages publiques (homepage, talents) qui veulent
 * savoir si un user est connecté pour adapter l'affichage.
 */
export const optionalJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch {
    req.user = null;
    res.clearCookie('token');
  }

  next();
};
