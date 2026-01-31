import 'dotenv/config';
import bodyParser from 'body-parser';
import express from 'express';
import router from './app/router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyJWT } from './app/middlewares/jwtVerify.js';
import { userInfo } from './app/middlewares/userInfoCookie.js';
import methodeOverride from 'method-override';
import { sequelize } from './app/database.js';

// ⚠️ IMPORTANT : Importez TOUS vos modèles ici
import './app/models/User.js';
import './app/models/Skill.js';
import './app/models/Role.js';
import './app/models/Message.js';
import './app/models/Review.js';
import './app/models/Notification.js';
import './app/models/index.js';
// Ajoutez tous vos autres modèles ici


const app = express();

// Middlewares
app.use(methodeOverride('_method'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://votre-domaine-render.onrender.com' // Remplacez par votre URL Render
    : 'http://localhost:3000',
  credentials: true
}));

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views/pages');

app.use(express.static('./public'));

app.use(userInfo);

// Routes
app.use('/protected', verifyJWT, router);
app.use(router);

// 404
app.use((req, res) => {
  const title = 'Page not found';
  const cssFile = "404";
  res.render('404', { title, cssFile });
});

// ✅ FONCTION DE DÉMARRAGE AVEC SYNC
async function startServer() {
  try {
    // 1. Tester la connexion
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    
    // 2. Synchroniser les tables (créer si elles n'existent pas)
    await sequelize.sync({ alter: true });
    console.log('✅ Tables synchronisées');
    
    // 3. Démarrer le serveur (IMPORTANT : 0.0.0.0 pour Render)
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Skillswap app started on port ${PORT}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur au démarrage:', error);
    process.exit(1);
  }
}

// Lancer le serveur
startServer();