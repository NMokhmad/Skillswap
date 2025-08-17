import 'dotenv/config';
import bodyParser from 'body-parser';
import express from 'express';
import router from './app/router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyJWT } from './app/middlewares/jwtVerify.js';
import { userInfo } from './app/middlewares/userInfoCookie.js';
import methodOverride from 'method-override';

const app = express();

// Middleware pour gérer PUT et DELETE via formulaires (rare en API, tu peux même le retirer si inutile)
app.use(methodOverride('_method'));

app.use(express.json());
app.use(cookieParser());

// CORS pour que React (localhost:3000) puisse appeler ton API
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

// Servir éventuellement des fichiers statiques (images, etc.)
app.use(express.static('./public'));

// Middleware pour récupérer l'utilisateur depuis un cookie JWT (optionnel mais utile pour API)
app.use(userInfo);  

// Routes protégées
app.use('/protected', verifyJWT, router);

// Routes publiques
app.use(router);

// Gestion 404 en JSON pur
app.use((req, res) => {
  res.status(404).json({ error: 'Page not found' });
});

const PORT = process.env.PORT || 5000; // ⚠️ mettre 5000 pour éviter conflit avec React
app.listen(PORT, () => {
  console.log(`🚀 Skillswap API started at http://localhost:${PORT}`);
});


