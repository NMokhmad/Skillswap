// Middleware pour rendre les infos utilisateur accessibles dans les vues EJS.
// Décode le JWT token (httpOnly) pour extraire les infos user.
// Plus besoin d'un cookie userInfo non-httpOnly lisible côté client.
import jwt from 'jsonwebtoken';

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
  }

  next();
};
