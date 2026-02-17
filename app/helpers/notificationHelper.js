import { Notification } from '../models/index.js';

// Instance Socket.IO, injectée depuis index.js après le setup
let io = null;

export function setSocketIO(socketIO) {
  io = socketIO;
}

/**
 * Crée une notification en BDD et l'envoie en temps réel via Socket.IO
 */
export async function createNotification({ userId, type, content, relatedEntityType = null, relatedEntityId = null, actionUrl = null }) {
  const notification = await Notification.create({
    user_id: userId,
    type_notification: type,
    content,
    related_entity_type: relatedEntityType,
    related_entity_id: relatedEntityId,
    action_url: actionUrl,
    is_read: false,
  });

  // Émettre en temps réel si Socket.IO est configuré
  if (io) {
    io.to(`user_${userId}`).emit('notification', {
      id: notification.id,
      type: notification.type_notification,
      content: notification.content,
      actionUrl: notification.action_url,
      createdAt: notification.created_at,
    });
  }

  return notification;
}
