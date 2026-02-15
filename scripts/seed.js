if (process.env.NODE_ENV !== 'production') {
  await import('dotenv/config');
}

import { sequelize } from '../app/database.js';
import { User, Role, Skill, Review, Message, Notification } from '../app/models/index.js';

try {
  await sequelize.sync();
  console.log('Tables synchronisees');

  // Roles
  const [userRole, adminRole] = await Promise.all([
    Role.findOrCreate({ where: { label: 'user' } }),
    Role.findOrCreate({ where: { label: 'admin' } }),
  ]);

  console.log('Roles crees');

  // Users
  const usersData = [
    { firstname: 'Badia', lastname: 'Abouanane', email: 'badia.abouanane@gmail.com', password: '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$6/N/x7wSFAeFzg0qzp9zJA', bio: 'je suis actuellement en reconversion professionnelle chez Oclock', image: 'defaultpp.jpg', interest: 'developpement web', is_available: true, role_id: userRole[0].id },
    { firstname: 'Mokhmad', lastname: 'Noutsoulkhanov', email: 'mokhmad.noutsoulkhanov@gmail.com', password: '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$8eDu3PYXEUZ55NClHbz9ww', bio: 'je suis fullstack mais avec une petite preference pour le back', image: 'defaultpp.jpg', interest: 'mathematiques', is_available: false, role_id: userRole[0].id },
    { firstname: 'Medhi', lastname: 'Lagil', email: 'mehdi.lagil@gmail.com', password: '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$BR5DIs2SOUoGoH8enea6OQ', bio: 'je kiffe le dev et la vie', image: 'defaultpp.jpg', interest: 'mathematiques', is_available: false, role_id: userRole[0].id },
    { firstname: 'Fatima', lastname: 'Zouhiri', email: 'fatima.zouhiri@gmail.com', password: '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$a2mHq9/wsxe4KHs4vh7C3w', bio: 'je suis fullstack mais avec une petite preference pour le back', image: 'defaultpp.jpg', interest: 'mathematiques', is_available: false, role_id: userRole[0].id },
  ];

  const users = [];
  for (const data of usersData) {
    const [user] = await User.findOrCreate({ where: { email: data.email }, defaults: data });
    users.push(user);
  }

  console.log('Users crees');

  // Skills
  const skillsData = [
    { label: 'Développement web', slug: 'developpement-web', icon: 'fa-code' },
    { label: 'Base de données', slug: 'base-de-donnees', icon: 'fa-database' },
    { label: 'Frontend', slug: 'frontend', icon: 'fa-palette' },
    { label: 'Backend', slug: 'backend', icon: 'fa-gears' },
  ];

  const skills = [];
  for (const data of skillsData) {
    const [skill] = await Skill.findOrCreate({ where: { slug: data.slug }, defaults: data });
    skills.push(skill);
  }

  console.log('Skills crees');

  // User <-> Skill associations
  const userSkills = [
    [0, [0, 1, 2, 3]],
    [1, [0, 2]],
    [2, [0, 1, 3]],
    [3, [0]],
  ];

  for (const [userIdx, skillIdxs] of userSkills) {
    await users[userIdx].addSkills(skillIdxs.map(i => skills[i]));
  }

  console.log('Associations user/skills crees');

  // Reviews (validate: false pour le rate 0 du seed SQL original)
  const reviewsData = [
    { rate: 5, content: 'tu es le developpeur que tu penses etre ! bsahtek', reviewer_id: users[0].id, reviewed_id: users[1].id, skill_id: skills[0].id },
    { rate: 2, content: 'tu es trop fort', reviewer_id: users[1].id, reviewed_id: users[0].id, skill_id: skills[0].id },
    { rate: 5, content: 'le meilleur pedagogue ever', reviewer_id: users[2].id, reviewed_id: users[0].id, skill_id: skills[0].id },
    { rate: 4, content: 'c est quoi une derive ? sinon tres bonne mathematicienne !', reviewer_id: users[1].id, reviewed_id: users[0].id, skill_id: skills[1].id },
  ];

  for (const data of reviewsData) {
    await Review.findOrCreate({
      where: { reviewer_id: data.reviewer_id, reviewed_id: data.reviewed_id, skill_id: data.skill_id },
      defaults: data,
    });
  }

  console.log('Reviews crees');

  // Messages
  const messagesData = [
    { content: 'Salut John, comment vas-tu ?', sender_id: users[0].id, receiver_id: users[1].id, is_read: false },
    { content: 'Salut Jane, je vais bien merci et toi ?', sender_id: users[1].id, receiver_id: users[0].id, is_read: false },
  ];

  for (const data of messagesData) {
    await Message.findOrCreate({
      where: { sender_id: data.sender_id, receiver_id: data.receiver_id, content: data.content },
      defaults: data,
    });
  }

  console.log('Messages crees');

  // Notifications
  const notificationsData = [
    { type_notification: 'message', content: 'tu as recu un message de Jane', user_id: users[0].id },
    { type_notification: 'review', content: 'tu as recu un avis de John', user_id: users[1].id },
  ];

  for (const data of notificationsData) {
    await Notification.findOrCreate({
      where: { user_id: data.user_id, type_notification: data.type_notification, content: data.content },
      defaults: data,
    });
  }

  console.log('Notifications crees');

  // Follows
  await users[2].addFollowed([users[0], users[1]]);

  console.log('Follows crees');
  console.log('Seed termine avec succes !');
  process.exit(0);
} catch (error) {
  console.error('Erreur lors du seed :', error);
  process.exit(1);
}
