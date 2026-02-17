import { Notification } from '../models/index.js';

const notificationController = {
  // Page dédiée : toutes les notifications, paginées
  async renderNotificationsPage(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = 20;
      const offset = (page - 1) * limit;

      const { count, rows: notifications } = await Notification.findAndCountAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit);
      const unreadCount = await Notification.count({
        where: { user_id: userId, is_read: false }
      });

      res.render('notifications', {
        notifications,
        title: 'Notifications',
        cssFile: 'notifications',
        currentPage: page,
        totalPages,
        unreadCount,
      });
    } catch (error) {
      console.error('Erreur renderNotificationsPage:', error);
      res.status(500).send('Erreur serveur');
    }
  },

  // API JSON : nombre de notifications non lues (pour le badge navbar)
  async getUnreadCount(req, res) {
    try {
      const count = await Notification.count({
        where: { user_id: req.user.id, is_read: false }
      });
      res.json({ count });
    } catch (error) {
      console.error('Erreur getUnreadCount:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // API JSON : 5 dernières notifications (pour le dropdown navbar)
  async getRecent(req, res) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']],
        limit: 5,
      });
      res.json({ notifications });
    } catch (error) {
      console.error('Erreur getRecent:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Marquer une notification comme lue
  async markAsRead(req, res) {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await Notification.findOne({
        where: { id: notificationId, user_id: req.user.id }
      });

      if (!notification) {
        return res.status(404).json({ error: 'Notification introuvable' });
      }

      await notification.update({ is_read: true });
      res.json({ success: true });
    } catch (error) {
      console.error('Erreur markAsRead:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(req, res) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user.id, is_read: false } }
      );
      res.json({ success: true });
    } catch (error) {
      console.error('Erreur markAllAsRead:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  // Supprimer une notification
  async deleteNotification(req, res) {
    try {
      const notificationId = parseInt(req.params.id);
      const deleted = await Notification.destroy({
        where: { id: notificationId, user_id: req.user.id }
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Notification introuvable' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Erreur deleteNotification:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  },
};

export default notificationController;
