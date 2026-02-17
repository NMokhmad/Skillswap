BEGIN;

-- TRUNCATE "role" RESTART IDENTITY;

INSERT INTO 
"role" ("label")
VALUES
('user'),
('admin');

-- SELECT setval('role_id_seq', (SELECT MAX(id) from "role"));

INSERT INTO 
"user" ("firstname", "lastname", "email", "password", "bio", "image", "interest", "is_available", "role_id")
VALUES
('Badia', 'Abouanane', 'badia.abouanane@gmail.com', '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$6/N/x7wSFAeFzg0qzp9zJA', 'je suis actuellement en reconversion professionnelle chez Oclock', 'defaultpp.jpg', 'developpement web', true, 1),
('Mokhmad', 'Noutsoulkhanov', 'mokhmad.noutsoulkhanov@gmail.com', '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$8eDu3PYXEUZ55NClHbz9ww', 'je suis fullstack mais avec une petite préférence pour le back', 'defaultpp.jpg', 'mathematiques', false, 1),
('Medhi', 'Lagil', 'mehdi.lagil@gmail.com', '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$BR5DIs2SOUoGoH8enea6OQ', 'je kiffe le dev et la vie', 'defaultpp.jpg', 'mathematiques', false, 1),
('Fatima', 'Zouhiri', 'fatima.zouhiri@gmail.com', '$argon2i$v=19$m=16,t=2,p=1$ZEI2bVNIUDNkSU12YXpPZw$a2mHq9/wsxe4KHs4vh7C3w', 'je suis fullstack mais avec une petite préférence pour le back', 'defaultpp.jpg', 'mathematiques', false, 1);

-- SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));

INSERT INTO
"skill" ("label", "slug", "icon")
VALUES 
('Développement web', 'developpement-web', 'fa-code'),
('Base de données', 'base-de-donnees', 'fa-database'),
('Frontend', 'frontend', 'fa-palette'),
('Backend', 'backend', 'fa-gears');

INSERT INTO
"review" ("rate", "content", "reviewer_id", "reviewed_id", "skill_id")
VALUES
(5, 'tu es le developpeur que tu penses être ! bsahtek', 1, 2, 1),
(2, 'tu es trop fort', 2, 1, 1),
(5, 'le meilleur pédagogue ever', 3, 1, 1),
(4, 'c''est quoi une dérivé ? sinon très bonne mathématicienne !', 2, 1, 2),
(3, 'test', 4, 1, 2);

INSERT INTO
"message" ("content", "sender_id", "receiver_id", "is_read")
VALUES
('Salut John, comment vas-tu ?', 1, 2, false),
('Salut Jane, je vais bien merci et toi ?', 2, 1, false);

INSERT INTO
"notification" ("type_notification", "content", "user_id")
VALUES
('message', 'tu as reçu un message de Jane', 1),
('review', 'tu as reçu un avis de John', 2);

INSERT INTO
"user_has_skill" ("user_id", "skill_id")
VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(2, 1),
(2, 3),
(3, 1),
(3, 2),
(3, 4),
(4, 1);

INSERT INTO
"user_has_follow" ("follower_id", "followed_id")
VALUES
(3, 1),
(3, 2);

COMMIT;
