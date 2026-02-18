# SkillSwap

Plateforme communautaire d'échange de compétences. Les utilisateurs partagent leurs savoir-faire, trouvent des talents, échangent des avis et communiquent entre eux.

**[Voir la démo en ligne](https://clownfish-app-hy864.ondigitalocean.app/)**

---

## Fonctionnalités

- **Authentification** — Inscription, connexion, logout avec JWT (cookies httpOnly)
- **Profils utilisateurs** — Bio, avatar (upload), compétences associées
- **Onboarding** — Parcours guidé après l'inscription (bio, avatar, choix de compétences)
- **Catalogue de compétences** — Navigation par compétence avec slug URL
- **Système de reviews** — Notes de 1 à 5 étoiles avec commentaires
- **Follow / Unfollow** — Suivi des profils intéressants
- **Notifications** — Badge, dropdown, page dédiée, marquage lu/non lu, temps réel Socket.IO
- **Messagerie temps réel** — Envoi instantané, indicateur de frappe, messages lus (`read_at`) + fallback HTTP
- **Recherche avancée** — Filtres dynamiques (texte, compétences, ville, note, tri), autocomplete, pagination
- **Recherches sauvegardées** — Sauvegarde, listing et suppression des filtres personnalisés
- **Classement** — Top 3 des profils les mieux notés en page d'accueil
- **Responsive** — Interface adaptée mobile, tablette et desktop

---

## Stack technique

| Couche | Technologie |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Base de données** | PostgreSQL |
| **ORM** | Sequelize |
| **Authentification** | JWT + Argon2 |
| **Validation** | Joi |
| **Templating** | EJS |
| **CSS** | Bulma |
| **Temps réel** | Socket.IO |
| **Upload** | Multer |
| **Tests** | Jest |
| **Déploiement** | DigitalOcean App Platform |

---

## Sécurité

- Hachage des mots de passe avec **Argon2** (résistant aux attaques GPU)
- JWT stocké en cookie **httpOnly + sameSite: Strict** (anti-XSS, anti-CSRF)
- En-têtes HTTP sécurisés via **Helmet** (CSP configurée)
- **Rate limiting** global + renforcé sur les routes d'authentification
- **Sanitisation HTML** sur toutes les entrées utilisateur
- Vérification d'ownership sur les routes protégées (un utilisateur ne peut modifier que son propre profil)
- Contraintes d'intégrité côté base de données (UNIQUE, CHECK, FK CASCADE)

---

## Architecture

```
app/
├── controllers/       # Logique métier (auth, profils, messages, notifications, recherche...)
├── models/            # Modèles Sequelize (User, Skill, Review, Message, Notification, SavedSearch...)
├── middlewares/       # JWT, upload, sanitisation, contexte utilisateur
├── schemas/           # Validation Joi (inscription, connexion, mise à jour)
├── helpers/           # Fonctions utilitaires (rating, notifications)
├── sockets/           # Handlers Socket.IO (messagerie temps réel)
├── database.js        # Connexion Sequelize
└── router.js          # Définition des routes

views/
├── pages/             # Templates EJS (16 pages)
└── partials/          # Composants réutilisables (header, navbar, footer)

public/
├── css/               # Feuilles de style
├── js/                # Scripts client (chat temps réel, socket, recherche dynamique, etc.)
└── uploads/           # Avatars uploadés

tests/                 # Tests unitaires Jest
data/                  # Scripts SQL (schéma + données de test)
```

---

## Base de données

9 tables avec intégrité référentielle complète :

```
user ──────── role
  │
  ├── user_has_skill ──── skill
  ├── user_has_follow ──── user (self-referential)
  ├── review (reviewer / reviewed / skill)
  ├── message (sender / receiver / is_read / read_at)
  ├── notification (is_read / related_entity_type / action_url)
  └── saved_search
```

- Contraintes `UNIQUE` pour éviter les doublons (email, reviews, follows)
- `CHECK` sur les notes (1-5)
- `ON DELETE CASCADE` pour la cohérence des données
- `TIMESTAMPTZ` pour le support des fuseaux horaires

---

## Installation locale

### Prérequis

- Node.js (v18+)
- PostgreSQL (v14+)

### 1. Cloner le projet

```bash
git clone https://github.com/NMokhmad/Skillswap.git
cd Skillswap
npm install
```

### 2. Créer la base de données

```bash
sudo -i -u postgres psql
```

```sql
CREATE ROLE skillswap WITH LOGIN PASSWORD 'skillswap';
CREATE DATABASE skillswap OWNER skillswap;
```

### 3. Initialiser le schéma et les données

```bash
npm run db:reset
```

### 4. Configurer l'environnement

Copier `.env.templates` en `.env` et adapter les valeurs :

```
PORT=3000
DATABASE_URL=postgres://skillswap:skillswap@localhost:5432/skillswap
JWT_SECRET=votre_clé_secrète
JWT_EXPIRES=1h
```

### 5. Lancer le serveur

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`

### 6. Migration d'une base existante (v1 -> v3)

Si ta base existe déjà avec un ancien schéma :

```bash
psql -U skillswap -d skillswap -f ./data/migration_v2.sql
psql -U skillswap -d skillswap -f ./data/migration_v3.sql
```

`migration_v2.sql` couvre les colonnes notifications.  
`migration_v3.sql` couvre `message.read_at`, `user.city`, et `saved_search`.

---

## Tests

```bash
npm test
```

Couverture : validation Joi, middleware JWT, contrôles d'autorisation.

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (watch mode) |
| `npm start` | Serveur de production |
| `npm test` | Lancer les tests Jest |
| `npm run db:create` | Créer le schéma SQL |
| `npm run db:seed` | Insérer les données de test |
| `npm run db:reset` | Réinitialiser la base complète |
| `npm run migrate` | Exécuter les migrations Sequelize |
| `npm run migrate:undo` | Annuler la dernière migration Sequelize |
| `npm run migrate:undo:all` | Annuler toutes les migrations Sequelize |
| `npm run migrate:status` | Afficher l'état des migrations |

---

## Auteur

**Mokhmad Noutsoulkhanov** — [GitHub](https://github.com/NMokhmad)
