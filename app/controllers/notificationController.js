import { Notification } from '../models/index.js';
import { sendApiError, sendApiSuccess } from '../helpers/apiResponse.js';
import { logger } from '../helpers/logger.js';

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
      logger.error('render_notifications_page_failed', { error: error?.message || 'Unknown error' });
      res.status(500).send('Erreur serveur');
    }
  },

  // API JSON : nombre de notifications non lues (pour le badge navbar)
  async getUnreadCount(req, res) {
    try {
      const count = await Notification.count({
        where: { user_id: req.user.id, is_read: false }
      });
      return sendApiSuccess(res, { count });
    } catch (error) {
      logger.error('get_notifications_count_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
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
      return sendApiSuccess(res, { notifications });
    } catch (error) {
      logger.error('get_recent_notifications_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
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
        return sendApiError(res, { status: 404, code: 'NOT_FOUND', message: 'Notification introuvable' });
      }

      await notification.update({ is_read: true });
      return sendApiSuccess(res, { success: true });
    } catch (error) {
      logger.error('mark_notification_read_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  // Marquer toutes les notifications comme lues
  async markAllAsRead(req, res) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user.id, is_read: false } }
      );
      return sendApiSuccess(res, { success: true });
    } catch (error) {
      logger.error('mark_all_notifications_read_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
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
        return sendApiError(res, { status: 404, code: 'NOT_FOUND', message: 'Notification introuvable' });
      }

      return sendApiSuccess(res, { success: true });
    } catch (error) {
      logger.error('delete_notification_failed', { error: error?.message || 'Unknown error' });
      return sendApiError(res, { status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },
};

export default notificationController;
