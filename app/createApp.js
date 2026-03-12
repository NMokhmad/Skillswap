import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import methodeOverride from 'method-override';
import { randomBytes } from 'crypto';
import router from './router.js';
import { sanitize } from './middlewares/sanitizeHtml.js';
import { userInfo } from './middlewares/userInfoCookie.js';
import { requestId } from './middlewares/requestId.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { captureException } from './helpers/sentry.js';
import { sendApiError } from './helpers/apiResponse.js';
import { logger } from './helpers/logger.js';

export function createApp() {
  const app = express();

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use((req, res, next) => {
    res.locals.cspNonce = randomBytes(16).toString('base64');
    next();
  });

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://kit.fontawesome.com",
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net/", "https://cdnjs.cloudflare.com/", "https://ka-f.fontawesome.com", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://ka-f.fontawesome.com", "https://cdnjs.cloudflare.com/", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://ka-f.fontawesome.com", "ws:", "wss:"],
        imgSrc: ["'self'", "data:"],
      },
    },
  }));

  const globalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Trop de requetes, reessayez dans une minute.',
  });
  app.use(globalLimiter);

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Trop de tentatives, reessayez dans 15 minutes.',
  });
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  app.use(requestId);
  app.use(methodeOverride('_method'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(sanitize);
  app.use(cookieParser());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }));

  app.use(express.static('./public'));

  app.use(userInfo);
  app.use(requestLogger);

  app.use(router);

  app.use((req, res) => {
    return sendApiError(res, {
      status: 404,
      code: 'NOT_FOUND',
      message: 'Endpoint not found.',
    });
  });

  app.use((err, req, res, _next) => {
    void _next;
    const context = {
      requestId: req.requestId || null,
      route: req.originalUrl || req.url,
      method: req.method,
      userId: req.user?.id || res.locals.user?.id || null,
      source: 'express',
    };
    logger.error('unhandled_error', {
      ...context,
      error: err?.message || 'Unknown error',
    });
    captureException(err, context);

    return sendApiError(res, {
      status: err?.status || 500,
      code: err?.code || 'SERVER_ERROR',
      message: err?.publicMessage || 'Erreur serveur',
    });
  });

  return app;
}
