import { User } from "./User.js";
import { Role } from "./Role.js";
import { Message } from "./Message.js";
import { Notification } from "./Notification.js";
import { Skill } from "./Skill.js";
import { Review } from "./Review.js";

User.belongsTo(Role, {
  foreignKey: 'role_id',
  as: 'role'
});

Role.hasMany(User, {
  foreignKey: 'role_id',
  as: 'users'
});

User.belongsToMany(Skill, {
  through: 'user_has_skill',
  as: 'skills',
  foreignKey: 'user_id'
});

Skill.belongsToMany(User, {
  through: 'user_has_skill',
  as: 'users',
  foreignKey: 'skill_id'
});

User.hasMany(Review, {
  foreignKey: 'reviewer_id',
  as: 'sent_reviews'
});

Review.belongsTo(User, {
  foreignKey: 'reviewer_id',
  as: 'reviewer'
});

User.hasMany(Review, {
  foreignKey: 'reviewed_id',
  as: 'received_reviews'
});

Review.belongsTo(User, {
  foreignKey: 'reviewed_id',
  as: 'reviewed'
});

User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sent_messages'
});

Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

User.hasMany(Message, {
  foreignKey: 'receiver_id',
  as: 'received_messages'
});

Message.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver'
});

User.hasMany(Notification, {
  foreignKey: 'user_id',
  as: 'notifications'
});

User.belongsToMany(User, {
  through: 'user_has_follow',
  foreignKey: 'followed_id',
  as: 'followers'
});

User.belongsToMany(User, {
  through: 'user_has_follow',
  foreignKey: 'follower_id',
  as: 'followed'
});

export { User, Role, Message, Notification, Skill, Review };
