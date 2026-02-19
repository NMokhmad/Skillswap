import { Message, User } from '../models/index.js';
import { createNotification } from '../helpers/notificationHelper.js';
import { captureException } from '../helpers/sentry.js';
import { logger } from '../helpers/logger.js';

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalClientMessageId(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 120) return null;
  return trimmed;
}

export function validateTypingPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, code: 'INVALID_PAYLOAD' };
  const receiverId = parsePositiveInt(payload.receiverId);
  if (!receiverId) return { ok: false, code: 'INVALID_RECEIVER' };
  return { ok: true, receiverId, isTyping: Boolean(payload.isTyping) };
}

export function validateReadPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, code: 'INVALID_PAYLOAD' };
  const otherUserId = parsePositiveInt(payload.otherUserId);
  if (!otherUserId) return { ok: false, code: 'INVALID_RECEIVER' };
  return { ok: true, otherUserId };
}

export function validateSendPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, code: 'INVALID_PAYLOAD' };
  const receiverId = parsePositiveInt(payload.receiverId);
  if (!receiverId) return { ok: false, code: 'INVALID_RECEIVER' };

  const cleanedContent = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (!cleanedContent) return { ok: false, code: 'EMPTY_CONTENT' };
  if (cleanedContent.length > 3000) return { ok: false, code: 'CONTENT_TOO_LONG' };

  return {
    ok: true,
    receiverId,
    cleanedContent,
    clientMessageId: parseOptionalClientMessageId(payload.clientMessageId),
  };
}

function isUserActiveInConversation(io, userId, otherUserId) {
  const room = io.sockets.adapter.rooms.get(`user_${userId}`);
  if (!room) return false;

  for (const socketId of room) {
    const userSocket = io.sockets.sockets.get(socketId);
    if (userSocket?.data?.activeConversationUserId === otherUserId) {
      return true;
    }
  }

  return false;
}

function toMessagePayload(message, clientMessageId = null) {
  return {
    id: message.id,
    content: message.content,
    senderId: message.sender_id,
    receiverId: message.receiver_id,
    isRead: message.is_read,
    readAt: message.read_at,
    createdAt: message.created_at,
    clientMessageId,
  };
}

function emitMessageToParticipants(io, payload) {
  io.to(`user_${payload.senderId}`).emit('message:new', payload);
  io.to(`user_${payload.receiverId}`).emit('message:new', payload);
}

export function registerMessageHandlers(io, socket) {
  socket.on('conversation:join', ({ otherUserId } = {}) => {
    const parsedOtherUserId = parsePositiveInt(otherUserId);
    socket.data.activeConversationUserId = parsedOtherUserId;
  });

  socket.on('conversation:leave', ({ otherUserId } = {}) => {
    const parsedOtherUserId = parsePositiveInt(otherUserId);
    if (!parsedOtherUserId || socket.data.activeConversationUserId === parsedOtherUserId) {
      socket.data.activeConversationUserId = null;
    }
  });

  socket.on('message:typing', ({ receiverId, isTyping } = {}) => {
    const validation = validateTypingPayload({ receiverId, isTyping });
    if (!validation.ok || validation.receiverId === socket.user.id) return;

    io.to(`user_${validation.receiverId}`).emit('message:typing', {
      senderId: socket.user.id,
      receiverId: validation.receiverId,
      isTyping: validation.isTyping,
    });
  });

  socket.on('message:read', async ({ otherUserId } = {}) => {
    try {
      const validation = validateReadPayload({ otherUserId });
      if (!validation.ok) {
        socket.emit('message:error', { code: validation.code, message: 'Payload invalide.' });
        return;
      }
      const parsedOtherUserId = validation.otherUserId;

      const readAt = new Date();

      await Message.update(
        { is_read: true, read_at: readAt },
        {
          where: {
            sender_id: parsedOtherUserId,
            receiver_id: socket.user.id,
            is_read: false,
          },
        }
      );

      const payload = {
        readerId: socket.user.id,
        otherUserId: parsedOtherUserId,
        readAt: readAt.toISOString(),
      };

      io.to(`user_${parsedOtherUserId}`).emit('messages:read:ack', payload);
      io.to(`user_${socket.user.id}`).emit('messages:read:ack', payload);
    } catch (error) {
      logger.error('socket_message_read_failed', { error: error?.message || 'Unknown error' });
      captureException(error, { source: 'socket', event: 'message:read', userId: socket.user?.id });
      socket.emit('message:error', { code: 'SERVER_ERROR', message: 'Erreur serveur.' });
    }
  });

  socket.on('message:send', async ({ receiverId, content, clientMessageId } = {}) => {
    try {
      const validation = validateSendPayload({ receiverId, content, clientMessageId });
      if (!validation.ok) {
        const messageByCode = {
          INVALID_PAYLOAD: 'Payload invalide.',
          INVALID_RECEIVER: 'Destinataire invalide.',
          EMPTY_CONTENT: 'Le message est vide.',
          CONTENT_TOO_LONG: 'Le message est trop long.',
        };
        socket.emit('message:error', { code: validation.code, message: messageByCode[validation.code] || 'Payload invalide.' });
        return;
      }
      const parsedReceiverId = validation.receiverId;
      const cleanedContent = validation.cleanedContent;
      const safeClientMessageId = validation.clientMessageId;

      if (!parsedReceiverId || parsedReceiverId === socket.user.id) {
        socket.emit('message:error', { code: 'INVALID_RECEIVER', message: 'Destinataire invalide.' });
        return;
      }

      const receiver = await User.findByPk(parsedReceiverId);
      if (!receiver) {
        socket.emit('message:error', { code: 'USER_NOT_FOUND', message: 'Destinataire introuvable.' });
        return;
      }

      const message = await Message.create({
        content: cleanedContent,
        sender_id: socket.user.id,
        receiver_id: parsedReceiverId,
        is_read: false,
      });

      emitMessageToParticipants(io, toMessagePayload(message, safeClientMessageId));

      const receiverIsActive = isUserActiveInConversation(io, parsedReceiverId, socket.user.id);
      if (!receiverIsActive) {
        await createNotification({
          userId: parsedReceiverId,
          type: 'message',
          content: `${socket.user.firstname} vous a envoye un message`,
          relatedEntityType: 'message',
          relatedEntityId: message.id,
          actionUrl: `/messages/${socket.user.id}`,
        });
      }
    } catch (error) {
      logger.error('socket_message_send_failed', { error: error?.message || 'Unknown error' });
      captureException(error, { source: 'socket', event: 'message:send', userId: socket.user?.id });
      socket.emit('message:error', { code: 'SERVER_ERROR', message: 'Erreur serveur.' });
    }
  });
}

export { isUserActiveInConversation, emitMessageToParticipants, toMessagePayload };
