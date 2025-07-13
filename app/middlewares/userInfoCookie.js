// Middleware pour récupérer l'utilisateur depuis le cookie et le rendre accessible dans les vues EJS
export const userInfo=((req, res, next) => {
  const userInfoCookie = req.cookies.userInfo;
  
  if (userInfoCookie) {
    try {
      res.locals.user = JSON.parse(userInfoCookie); // Convertir le cookie en objet JSON
      console.log(res.locals.user);
    } catch (error) {
      console.error("Erreur parsing du cookie userInfo:", error);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
});