import { Op } from 'sequelize';
import { User, Message } from '../models/index.js';
import { sequelize } from '../database.js';

const messageController = {
  async renderMessagesPage(req, res) {
    try {
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (!userInfo || !userInfo.id) {
        return res.redirect('/login');
      }

      const userId = userInfo.id;

      // Récupérer tous les messages de l'utilisateur
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

      // Grouper par conversation (l'autre utilisateur)
      const conversationsMap = new Map();
      for (const msg of messages) {
        const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (!conversationsMap.has(otherId)) {
          const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
          const unreadCount = await Message.count({
            where: { sender_id: otherId, receiver_id: userId, is_read: false }
          });
          conversationsMap.set(otherId, {
            user: otherUser,
            lastMessage: msg,
            unreadCount
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
      console.error('Erreur renderMessagesPage:', error);
      res.status(500).send('Erreur serveur');
    }
  },

  async renderConversation(req, res) {
    try {
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (!userInfo || !userInfo.id) {
        return res.redirect('/login');
      }

      const userId = userInfo.id;
      const otherUserId = parseInt(req.params.userId);

      const otherUser = await User.findByPk(otherUserId);
      if (!otherUser) {
        return res.status(404).render('404', { title: 'Utilisateur introuvable', cssFile: '404' });
      }

      // Récupérer les messages entre les deux utilisateurs
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
      await Message.update(
        { is_read: true },
        {
          where: {
            sender_id: otherUserId,
            receiver_id: userId,
            is_read: false
          }
        }
      );

      res.render('conversation', {
        messages,
        otherUser,
        currentUserId: userId,
        title: `Conversation avec ${otherUser.firstname}`,
        cssFile: 'messages'
      });
    } catch (error) {
      console.error('Erreur renderConversation:', error);
      res.status(500).send('Erreur serveur');
    }
  },

  async sendMessage(req, res) {
    try {
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (!userInfo || !userInfo.id) {
        return res.redirect('/login');
      }

      const senderId = userInfo.id;
      const receiverId = parseInt(req.params.userId);
      const { content } = req.body;

      if (!content || !content.trim()) {
        return res.redirect(`/messages/${receiverId}`);
      }

      const receiver = await User.findByPk(receiverId);
      if (!receiver) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      await Message.create({
        content: content.trim(),
        sender_id: senderId,
        receiver_id: receiverId,
        is_read: false
      });

      res.redirect(`/messages/${receiverId}`);
    } catch (error) {
      console.error('Erreur sendMessage:', error);
      res.status(500).send('Erreur serveur');
    }
  }
};

export default messageController;
