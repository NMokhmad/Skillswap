import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import router from './app/router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userInfo } from './app/middlewares/userInfoCookie.js';
import methodeOverride from 'method-override';
import { sanitize } from './app/middlewares/sanitizeHtml.js';
import { sequelize } from './app/database.js';
import { setSocketIO } from './app/helpers/notificationHelper.js';

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
      connectSrc: ["'self'", "https://ka-f.fontawesome.com", "ws:", "wss:"],
      imgSrc: ["'self'", "data:"],
    }
  }
}));

// Rate limiting global : 100 requêtes par minute par IP
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
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
  res.status(500).render('500', { title: 'Erreur serveur', cssFile: '404' });
});

// ─── Socket.IO ───
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }
});

// Authentification Socket.IO via cookie JWT
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;
    if (!token) return next(new Error('Non authentifié'));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch {
    next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  // Rejoindre la room personnelle pour les notifications
  socket.join(`user_${socket.user.id}`);

  socket.on('disconnect', () => {
    socket.leave(`user_${socket.user.id}`);
  });
});

// Injecter l'instance io dans le helper notifications
setSocketIO(io);

// Rendre io accessible aux controllers via app.locals
app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Skillswap app started at http://localhost:${PORT}`);
});
