import { Message, User } from '../models/index.js';
import { createNotification } from '../helpers/notificationHelper.js';

function parsePositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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
    const parsedReceiverId = parsePositiveInt(receiverId);
    if (!parsedReceiverId || parsedReceiverId === socket.user.id) return;

    io.to(`user_${parsedReceiverId}`).emit('message:typing', {
      senderId: socket.user.id,
      receiverId: parsedReceiverId,
      isTyping: Boolean(isTyping),
    });
  });

  socket.on('message:read', async ({ otherUserId } = {}) => {
    try {
      const parsedOtherUserId = parsePositiveInt(otherUserId);
      if (!parsedOtherUserId) return;

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
      console.error('Erreur Socket message:read:', error);
      socket.emit('message:error', { code: 'SERVER_ERROR', message: 'Erreur serveur.' });
    }
  });

  socket.on('message:send', async ({ receiverId, content, clientMessageId } = {}) => {
    try {
      const parsedReceiverId = parsePositiveInt(receiverId);
      const cleanedContent = typeof content === 'string' ? content.trim() : '';

      if (!parsedReceiverId || parsedReceiverId === socket.user.id) {
        socket.emit('message:error', { code: 'INVALID_RECEIVER', message: 'Destinataire invalide.' });
        return;
      }

      if (!cleanedContent) {
        socket.emit('message:error', { code: 'EMPTY_CONTENT', message: 'Le message est vide.' });
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

      emitMessageToParticipants(io, toMessagePayload(message, clientMessageId || null));

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
      console.error('Erreur Socket message:send:', error);
      socket.emit('message:error', { code: 'SERVER_ERROR', message: 'Erreur serveur.' });
    }
  });
}

export { isUserActiveInConversation, emitMessageToParticipants, toMessagePayload };
