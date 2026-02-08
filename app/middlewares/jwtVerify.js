import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;  // Récupère le token du cookie
  if (!token) {
    return res.status(401).json({ error: 'Accès non autorisé' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.redirect('/'); // Ajoute les données du user dans req
    next();
  } catch (error) {
    console.error('Erreur de vérification du token JWT:', error);
    return res.status(403).json({ error: 'Token invalide' });
  }
};