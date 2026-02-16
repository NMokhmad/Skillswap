import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './app/router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userInfo } from './app/middlewares/userInfoCookie.js';
import methodeOverride from 'method-override';
import { sanitize } from './app/middlewares/sanitizeHtml.js';
import { sequelize } from './app/database.js';

// Sync BDD : alter en dev, sync simple en prod (crée les tables manquantes)
if (process.env.NODE_ENV === 'production') {
  sequelize.sync()
    .then(() => console.log('Base de donnees synchronisee (prod)'))
    .catch((err) => console.error('Erreur sync DB :', err));
} else {
  sequelize.sync({ alter: true })
    .then(() => console.log('Base de donnees synchronisee (dev)'))
    .catch((err) => console.error('Erreur sync DB :', err));
}

const app = express();

// Trust proxy en production (DigitalOcean utilise un reverse proxy)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Sécurité : en-têtes HTTP (XSS, clickjacking, sniffing MIME, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://kit.fontawesome.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net/", "https://cdnjs.cloudflare.com/", "https://ka-f.fontawesome.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://ka-f.fontawesome.com", "https://cdnjs.cloudflare.com/", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://ka-f.fontawesome.com"],
      imgSrc: ["'self'", "data:"],
    }
  }
}));

// Rate limiting global : 100 requêtes par minute par IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes, réessayez dans une minute.'
});
app.use(globalLimiter);

// Rate limiting strict sur auth : 10 tentatives par 15 min par IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de tentatives, réessayez dans 15 minutes.'
});
app.use('/login', authLimiter);
app.use('/register', authLimiter);

app.use(methodeOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitize);
app.use(cookieParser());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.use(express.static('./public'));

// Rend les infos user disponibles dans les vues EJS (navbar, etc.)
app.use(userInfo);

// Toutes les routes - la protection JWT est gérée route par route dans le router
app.use(router);

// 404 handler
app.use((req, res) => {
  const title = 'Page not found';
  const cssFile = '404';
  res.render('404', { title, cssFile });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('404', { title: 'Erreur serveur', cssFile: '404' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Skillswap app started at http://localhost:${PORT}`);
});
