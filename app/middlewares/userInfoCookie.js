// Middleware pour rendre les infos utilisateur accessibles dans les vues EJS.
// Utilise req.user (peuplé par verifyJWT ou optionalJWT) comme source de vérité,
// avec fallback sur le cookie userInfo pour l'affichage uniquement.
export const userInfo = (req, res, next) => {
  if (req.user) {
    // Source fiable : le JWT vérifié
    res.locals.user = req.user;
  } else {
    // Fallback pour les pages sans middleware JWT :
    // on utilise le cookie pour l'affichage (navbar) uniquement
    const userInfoCookie = req.cookies.userInfo;
    if (userInfoCookie) {
      try {
        res.locals.user = JSON.parse(userInfoCookie);
      } catch (error) {
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }
  }
  next();
};
