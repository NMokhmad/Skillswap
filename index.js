import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import { checkDatabaseConnection, sequelize } from './app/database.js';
import { setSocketIO } from './app/helpers/notificationHelper.js';
import { registerMessageHandlers } from './app/sockets/messageHandler.js';
import { createApp } from './app/createApp.js';
import { initSentry, captureException } from './app/helpers/sentry.js';
import { logger } from './app/helpers/logger.js';

await initSentry();
const app = createApp();

// ─── Socket.IO ───
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },
  transports: ['websocket'],
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
    captureException(new Error('Socket auth failed'), {
      source: 'socket',
      event: 'socket-auth',
    });
    next(new Error('Token invalide'));
  }
});

io.on('connection', (socket) => {
  // Rejoindre la room personnelle pour les notifications
  socket.join(`user_${socket.user.id}`);
  socket.data.activeConversationUserId = null;

  registerMessageHandlers(io, socket);

  socket.on('disconnect', () => {
    socket.leave(`user_${socket.user.id}`);
  });
});

// Injecter l'instance io dans le helper notifications
setSocketIO(io);

// Rendre io accessible aux controllers via app.locals
app.set('io', io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, async () => {
  await checkDatabaseConnection();

  if (process.env.ENABLE_SEQUELIZE_SYNC === 'true') {
    try {
      await sequelize.sync();
      logger.warn('database_sync_enabled', { env: process.env.NODE_ENV || 'development' });
    } catch (error) {
      logger.error('database_sync_error', { error: error?.message || 'Unknown error' });
    }
  }

  logger.info('server_started', {
    url: `http://localhost:${PORT}`,
    env: process.env.NODE_ENV || 'development',
  });
});
