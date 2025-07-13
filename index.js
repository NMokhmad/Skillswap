import 'dotenv/config';
import bodyParser from 'body-parser';
import express from 'express';
import router from './app/router.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { verifyJWT } from './app/middlewares/jwtVerify.js';
import { userInfo } from './app/middlewares/userInfoCookie.js';
import methodeOverride from 'method-override';
import serverless from 'serverless-http'; // <-- IMPORTANT

const app = express();
app.use(methodeOverride('_method'));
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

app.use(userInfo);

app.use('/protected', verifyJWT, router);
app.use(router);

app.use((req, res) => {
  const title = 'Page not found';
  const cssFile = "404";
  res.render('404', { title, cssFile });
});

// PLUS de app.listen ici !!!

// Exporte la fonction handler compatible serverless pour Vercel
export const handler = serverless(app);

