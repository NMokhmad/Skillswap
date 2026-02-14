import jwt from 'jsonwebtoken';

/**
 * Middleware strict : bloque l'accès si le JWT est absent ou invalide.
 * Pour les routes de pages (GET) → redirige vers /login
 * Pour les routes API (POST/PUT/DELETE) → retourne du JSON 401
 */
export const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    if (req.method === 'GET') {
      return res.redirect('/login');
    }
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.clearCookie('token');
    res.clearCookie('userInfo');
    if (req.method === 'GET') {
      return res.redirect('/login');
    }
    return res.status(403).json({ error: 'Token invalide ou expiré' });
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
  } catch (error) {
    req.user = null;
    res.clearCookie('token');
    res.clearCookie('userInfo');
  }

  next();
};
