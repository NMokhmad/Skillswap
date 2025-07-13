import 'dotenv/config';
import bodyParser from 'body-parser';
import express from 'express';
import router from './app/router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyJWT } from './app/middlewares/jwtVerify.js';
import { userInfo } from './app/middlewares/userInfoCookie.js';
import methodeOverride from 'method-override';

const app = express();
app.use(methodeOverride('_method')); // Middleware pour gérer les requêtes PUT et DELETE via des formulaires
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.use(express.static('./public'));

app.use(userInfo); // Middleware pour récupérer l'utilisateur depuis le cookie et le rendre accessible dans les vues EJS  

// Middleware pour vérifier le jwt token et le CSRF token
app.use('/protected',verifyJWT, router);
app.use(router);

// app.use('404')
app.use((req, res) => {
  const title= 'Page not found';
  const cssFile="404";
  res.render('404', { title, cssFile });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Skillswap app started at http://localhost:${PORT}`);
});
