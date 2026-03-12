import { Op } from 'sequelize';
import { User, Message } from '../models/index.js';
import { sequelize } from '../database.js';
import { createNotification } from '../helpers/notificationHelper.js';
import { emitMessageToParticipants, isUserActiveInConversation, toMessagePayload } from '../sockets/messageHandler.js';
import { sendApiError, sendApiSuccess } from '../helpers/apiResponse.js';
import { logger } from '../helpers/logger.js';

const messageController = {
  // Route protégée par verifyJWT → req.user est garanti
  async renderMessagesPage(req, res) {
    try {
      const userId = req.user.id;

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        },
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' }
        ],
        order: [['created_at', 'DESC']]
      });

      // UNE SEULE requête pour tous les counts de messages non lus
      // Au lieu de N requêtes dans la boucle (problème N+1)
      const unreadCounts = await Message.findAll({
        attributes: [
          'sender_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          receiver_id: userId,
          is_read: false
        },
        group: ['sender_id'],
        raw: true
      });

      // Transformer en Map pour lookup O(1)
      const unreadMap = new Map();
      for (const row of unreadCounts) {
        unreadMap.set(row.sender_id, parseInt(row.count));
      }

      // Grouper par conversation
      const conversationsMap = new Map();
      for (const msg of messages) {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversationsMap.has(otherId)) {
          const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
          conversationsMap.set(otherId, {
            user: otherUser,
            lastMessage: msg,
            unreadCount: unreadMap.get(otherId) || 0
          });
        }
      }

      const conversations = Array.from(conversationsMap.values());

      res.render('messages', {
        conversations,
        title: 'Messages',
        cssFile: 'messages'
      });
    } catch (error) {
      logger.error('render_messages_page_failed', { error: error?.message || 'Unknown error' });
      res.status(500).send('Erreur serveur');
    }
  },

  // Route protégée par verifyJWT → req.user est garanti
  async renderConversation(req, res) {
    try {
      const userId = req.user.id;
      const otherUserId = parseInt(req.params.userId);

      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return res.status(404).render('404', { title: 'Utilisateur introuvable', cssFile: '404' });
      }

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: otherUserId },
            { sender_id: otherUserId, receiver_id: userId }
          ]
        },
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' }
        ],
        order: [['created_at', 'ASC']]
      });

      // Marquer les messages reçus comme lus
      const readAt = new Date();
      await Message.update(
        { is_read: true, read_at: readAt },
        {
          where: {
            sender_id: otherUserId,
            receiver_id: userId,
            is_read: false
          }
        }
      );

      const io = req.app.get('io');
      if (io) {
        const payload = {
          readerId: userId,
          otherUserId,
          readAt: readAt.toISOString(),
        };
        io.to(`user_${otherUserId}`).emit('messages:read:ack', payload);
        io.to(`user_${userId}`).emit('messages:read:ack', payload);
      }

      res.render('conversation', {
        messages,
        otherUser,
        currentUserId: userId,
        title: `Conversation avec ${otherUser.firstname}`,
        cssFile: 'messages'
      });
    } catch (error) {
      logger.error('render_conversation_failed', { error: error?.message || 'Unknown error' });
      res.status(500).send('Erreur serveur');
    }
  },

  // Route protégée par verifyJWT → req.user est garanti
  async sendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const receiverId = parseInt(req.params.userId);
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.redirect(`/messages/${receiverId}`);
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      const message = await Message.create({
        content: content.trim(),
        sender_id: senderId,
        receiver_id: receiverId,
        is_read: false
      });

      const io = req.app.get('io');
      if (io) {
        emitMessageToParticipants(io, toMessagePayload(message));
      }

      // Notification au destinataire uniquement s'il n'est pas actif sur la conversation
      const receiverActive = io ? isUserActiveInConversation(io, receiverId, senderId) : false;
      if (!receiverActive) {
        const sender = await User.findByPk(senderId);
        await createNotification({
          userId: receiverId,
          type: 'message',
          content: `${sender.firstname} vous a envoye un message`,
          relatedEntityType: 'message',
          relatedEntityId: message.id,
          actionUrl: `/messages/${senderId}`,
        });
      }

      res.redirect(`/messages/${receiverId}`);
    } catch (error) {
      logger.error('send_message_failed', { error: error?.message || 'Unknown error' });
      res.status(500).send('Erreur serveur');
    }
  },

  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        },
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' }
        ],
        order: [['created_at', 'DESC']]
      });

      const unreadCounts = await Message.findAll({
        attributes: [
          'sender_id',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { receiver_id: userId, is_read: false },
        group: ['sender_id'],
        raw: true
      });

      const unreadMap = new Map();
      for (const row of unreadCounts) {
        unreadMap.set(row.sender_id, parseInt(row.count));
      }

      const conversationsMap = new Map();
      for (const msg of messages) {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversationsMap.has(otherId)) {
          const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
          conversationsMap.set(otherId, {
            user: { id: otherUser.id, firstname: otherUser.firstname, lastname: otherUser.lastname, image: otherUser.image },
            lastMessage: msg,
            unreadCount: unreadMap.get(otherId) || 0
          });
        }
      }

      return sendApiSuccess(res, { conversations: Array.from(conversationsMap.values()) });
    } catch (error) {
      logger.error('get_conversations_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async getConversation(req, res) {
    try {
      const userId = req.user.id;
      const otherUserId = parseInt(req.params.userId);

      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return sendApiError(res, { status: 404, code: 'NOT_FOUND', message: 'Utilisateur introuvable' });
      }

      const messages = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: otherUserId },
            { sender_id: otherUserId, receiver_id: userId }
          ]
        },
        include: [
          { model: User, as: 'sender' },
          { model: User, as: 'receiver' }
        ],
        order: [['created_at', 'ASC']]
      });

      const readAt = new Date();
      await Message.update(
        { is_read: true, read_at: readAt },
        { where: { sender_id: otherUserId, receiver_id: userId, is_read: false } }
      );

      const io = req.app.get('io');
      if (io) {
        const payload = { readerId: userId, otherUserId, readAt: readAt.toISOString() };
        io.to(`user_${otherUserId}`).emit('messages:read:ack', payload);
        io.to(`user_${userId}`).emit('messages:read:ack', payload);
      }

      return sendApiSuccess(res, {
        otherUser: { id: otherUser.id, firstname: otherUser.firstname, lastname: otherUser.lastname, image: otherUser.image },
        messages,
      });
    } catch (error) {
      logger.error('get_conversation_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async apiSendMessage(req, res) {
    try {
      const senderId = req.user.id;
      const receiverId = parseInt(req.params.userId);
      const { content } = req.body;

      if (!content || !content.trim()) {
        return sendApiError(res, { status: 400, code: 'BAD_REQUEST', message: 'Le message ne peut pas être vide' });
      }

      if (content.trim().length > 3000) {
        return sendApiError(res, { status: 400, code: 'CONTENT_TOO_LONG', message: 'Le message ne peut pas dépasser 3000 caractères' });
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return sendApiError(res, { status: 404, code: 'NOT_FOUND', message: 'Utilisateur introuvable' });
      }

      const message = await Message.create({
        content: content.trim(),
        sender_id: senderId,
        receiver_id: receiverId,
        is_read: false
      });

      const io = req.app.get('io');
      if (io) {
        emitMessageToParticipants(io, toMessagePayload(message));
      }

      const receiverActive = io ? isUserActiveInConversation(io, receiverId, senderId) : false;
      if (!receiverActive) {
        const sender = await User.findByPk(senderId);
        await createNotification({
          userId: receiverId,
          type: 'message',
          content: `${sender.firstname} vous a envoye un message`,
          relatedEntityType: 'message',
          relatedEntityId: message.id,
          actionUrl: `/messages/${senderId}`,
        });
      }

      return sendApiSuccess(res, { message }, 201);
    } catch (error) {
      logger.error('api_send_message_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async getUnreadCount(req, res) {
    try {
      const count = await Message.count({
        where: {
          receiver_id: req.user.id,
          is_read: false,
        }
      });
      return sendApiSuccess(res, { count });
    } catch (error) {
      logger.error('get_unread_messages_count_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  }
};

export default messageController;
