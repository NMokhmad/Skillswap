# Architecture & Décisions Techniques — Skillswap

> Document de référence pour comprendre le *pourquoi* du projet, pas seulement le *quoi*.
> Rédigé pour permettre de présenter et défendre ces choix devant une équipe technique.

---

## Table des matières

1. [Vision globale](#1-vision-globale)
2. [Choix structurels](#2-choix-structurels)
3. [Choix technologiques](#3-choix-technologiques)
4. [Patterns et conventions](#4-patterns-et-conventions)
5. [Flux de données](#5-flux-de-données)
6. [Décisions non-évidentes](#6-décisions-non-évidentes)

---

## 1. Vision globale

**Le problème résolu** : connecter des gens qui ont des compétences avec des gens qui en cherchent — une place de marché de compétences humaines, sans argent, juste de l'échange et de la visibilité.

**La logique architecturale** : l'application est un **monolithe MVC server-rendered avec une couche temps-réel greffée dessus**. C'est une décision délibérée et cohérente :

- Tout vient du même serveur Express (pas de séparation API/frontend)
- Les pages HTML sont générées côté serveur avec EJS
- Socket.IO s'occupe uniquement de ce qui nécessite du temps réel (messages, notifications)
- Le reste est du bon vieux formulaire HTML classique

**Pourquoi ce choix plutôt qu'un SPA React + API REST séparée ?** Pour un projet de cette envergure (1 développeur, audience modeste, MVP), un monolithe simplifie radicalement le déploiement, l'authentification et le debug. Tu n'as pas besoin de gérer CORS entre un frontend et un backend séparés, tu n'as pas besoin de déployer deux applications, et les performances sont correctes grâce au SSR.

---

## 2. Choix structurels

```
app/
├── controllers/     ← Orchestration (reçoit, délègue, répond)
├── models/          ← Représentation des données (Sequelize)
├── middlewares/     ← Traitements transversaux (auth, logs, sécurité)
├── schemas/         ← Validation entrées (Joi)
├── helpers/         ← Utilitaires partagés
├── sockets/         ← Logique temps-réel (séparée du HTTP)
├── createApp.js     ← Usine Express (testable)
├── router.js        ← Table de routage centralisée
└── database.js      ← Connexion Sequelize
```

### Pourquoi `createApp.js` séparé de `index.js` ?

C'est le pattern "App Factory". `index.js` démarre le serveur (bind le port, crée le Socket.IO). `createApp.js` configure Express sans démarrer le serveur. Ça permet d'importer l'app dans les tests sans lancer un vrai serveur — essentiel pour les tests d'intégration.

### Pourquoi `schemas/` séparé des `controllers/` ?

La validation Joi est isolée pour deux raisons : réutilisabilité (même schéma login utilisé dans le contrôleur et dans les tests) et lisibilité (le contrôleur ne se noie pas dans des règles de validation). Si on l'enlève, les contrôleurs deviennent des monstres illisibles.

### Pourquoi `sockets/messageHandler.js` séparé ?

La logique WebSocket est fondamentalement différente du HTTP : pas de req/res, gestion des événements, état de connexion. La séparer évite de polluer `index.js` avec 200 lignes de handlers Socket.IO.

### Pourquoi `helpers/` ?

Trois utilitaires transversaux qui n'appartiennent à aucun contrôleur :

- `notificationHelper.js` : créer une notification *et* l'émettre en temps réel — utilisé depuis plusieurs contrôleurs (follow, review, message)
- `apiResponse.js` : contrat de réponse uniforme pour les endpoints JSON
- `logger.js` : logging structuré utilisable partout

---

## 3. Choix technologiques

### Express.js (pas Fastify, pas NestJS)

Express est le choix le plus pragmatique pour un projet pédagogique/MVP : documentation abondante, communauté massive, aucune "magie" cachée. Fastify serait plus performant mais plus complexe. NestJS apporterait une structure forcée utile en grande équipe, mais trop lourde ici.

### Sequelize ORM (pas raw SQL, pas Prisma)

Sequelize gère automatiquement les requêtes paramétrées (protection SQL injection) et les associations. Les migrations versionnent le schéma comme du code. Prisma est une alternative (DX meilleure, TypeScript-first) mais Sequelize est plus mature. Le vrai trade-off : on perd du contrôle sur les requêtes complexes — ici compensé par du SQL brut sur les recherches avancées (COUNT, AVG dans les queries de recherche).

### Argon2 (pas bcrypt)

C'est le choix OWASP-recommandé depuis 2015. Argon2id est **memory-hard** : même avec un GPU, une attaque par force brute est exponentiellement plus coûteuse qu'avec bcrypt. L'inconvénient : vérification légèrement plus lente (~200ms vs ~100ms), mais c'est justement ce qu'on veut pour ralentir les attaquants.

Paramètres par défaut : `m=65536, t=3, p=4`.

### JWT dans un cookie httpOnly (pas localStorage)

Le classique piège des débutants : mettre le JWT dans `localStorage`. Accessible par JavaScript → XSS = vol de session. Un cookie httpOnly est inaccessible au JS, donc une injection XSS ne peut pas exfiltrer le token. `SameSite:Strict` bloque les requêtes cross-origin → protection CSRF sans avoir besoin de tokens CSRF dédiés.

### Socket.IO (pas WebSocket natif, pas SSE)

Socket.IO ajoute au-dessus des WebSockets natifs : reconnexion automatique, rooms nommées, fallback transport. La configuration choisit `transports: ['websocket']` only (pas de polling) ce qui est le bon choix en production où les proxys supportent le WebSocket. Les rooms (`user_${id}`) permettent d'envoyer un message directement à un utilisateur sans tenir une Map globale de sockets.

### EJS (pas React, pas Vue)

Rendu serveur = pas besoin d'hydratation, pas de JS client obligatoire pour afficher du contenu, SEO out-of-the-box. Pour une app qui affiche des profils publics indexables par Google, c'est le bon choix. La contrepartie : chaque navigation recharge la page. Mais Socket.IO gère les cas où la fluidité est critique (chat).

### Bulma (pas Tailwind, pas Bootstrap)

Bulma est purement CSS (zéro JS), basé sur Flexbox, et ses classes sémantiques sont lisibles. Tailwind serait plus puissant mais nécessite un processus de build pour le purge CSS. Bootstrap inclut du JS inutile. Pour un projet sans bundler complexe, Bulma est le juste milieu.

### Joi (pas Zod, pas validation manuelle)

Joi est le standard historique de l'écosystème Node.js pour la validation d'objets. Il génère des messages d'erreur structurés réutilisables dans l'UI. Zod est une alternative TypeScript-native mais ce projet est en JavaScript pur.

### Jest (pas Mocha/Vitest)

Jest fonctionne out-of-the-box sans configuration pour Node.js : runner, assertions et mocks intégrés. Vitest serait plus rapide mais pensé pour Vite/ESM. Mocha nécessite plus de configuration.

---

## 4. Patterns et conventions

### Pattern MVC strict

Chaque couche a une responsabilité unique :

| Couche | Rôle | Exemple |
|--------|------|---------|
| **Router** | Table de routage only, aucune logique | `router.post('/review/:userId', verifyJWT, reviewController.createReview)` |
| **Middleware** | Traitement transversal (auth, log, sanitize) | `verifyJWT`, `sanitizeHtml` |
| **Controller** | Coordination (valide → appelle modèle → répond) | `authController.register` |
| **Model** | Accès données + associations | `User.findByPk(42, { include: [...] })` |

### Middleware en chaîne

```js
router.post('/review/:userId', verifyJWT, sanitizeHtml, reviewController.createReview)
```

Chaque middleware a une responsabilité atomique. L'ordre compte : on vérifie l'auth *avant* de toucher la DB. Ce pattern est extensible sans modifier les controllers.

### Dual JWT middleware (`verifyJWT` vs `optionalJWT`)

Les routes publiques (catalogue, profils) utilisent `optionalJWT` : si le cookie est présent et valide, on enrichit la requête avec l'utilisateur, sinon on continue sans. Ça évite de dupliquer les templates pour les visiteurs vs connectés.

### Request ID / Correlation

Chaque requête reçoit un UUID unique propagé dans les logs et les réponses d'erreur. En production, si un utilisateur signale une erreur, on peut retrouver exactement son chemin dans les logs en cherchant ce requestId.

### Notification helper centralisé

```js
// notificationHelper.js
await createAndSendNotification(io, { userId, type, content, actionUrl })
```

Créer une notification (DB) *et* l'émettre en WebSocket sont toujours fait ensemble. Centraliser ça évite d'oublier l'une ou l'autre des opérations dans les contrôleurs qui génèrent des notifications.

### Dummy password hash contre les timing attacks

```js
// Si l'utilisateur n'existe pas, on vérifie quand même un hash dummy
// pour que le temps de réponse soit identique
const hash = user ? user.password : DUMMY_PASSWORD_HASH
await argon2.verify(hash, password)
```

Sans ça, une requête avec email inexistant retourne immédiatement (pas de hash à vérifier), alors qu'une requête avec email existant prend ~200ms. La différence de timing permet à un attaquant de déduire si un email est enregistré.

---

## 5. Flux de données

### Flux 1 : Consultation d'un profil public

```
Browser → GET /talents/42
  → optionalJWT (lit le cookie, decode JWT si présent)
  → talentController.renderTalentPage()
    → User.findByPk(42, { include: [Skills, Reviews] })
    → res.render('talent.ejs', { user, currentUser })
  → HTML complet généré serveur → Browser
```

### Flux 2 : Envoi d'un message (temps réel)

```
Browser (chat.js)
  → socket.emit('message:send', { receiverId: 7, content: '...', clientMessageId: 'temp-123' })

Server (messageHandler.js)
  → validateSendPayload(payload)
  → Message.create({ sender_id: socket.user.id, receiver_id: 7, content })
  → io.to('user_${socket.user.id}').emit('message:new', payload)   ← Confirmation expéditeur
  → io.to('user_7').emit('message:new', payload)                    ← Notification destinataire
  → createAndSendNotification(io, { userId: 7, type: 'message', ... })

Browser (récepteur - socket.js)
  → Écoute 'message:new'
  → Si dans conversation active → ajoute message à l'UI (chat.js)
  → Si ailleurs → affiche toast notification + badge +1
```

### Flux 3 : Recherche avancée

```
Browser (search.js)
  → Fetch GET /api/search/talents?q=Thomas&skills[]=3&min_rating=4&sort=rating_desc&page=2

Server (searchController.js)
  → Validation et parsing des paramètres
  → Query Sequelize avec :
      - JOIN user_has_skill (filtre compétences)
      - HAVING AVG(rate) >= 4 (filtre note minimale)
      - COUNT followers (pour tri "popular")
      - LIMIT 20 OFFSET 20 (pagination)
  → { users: [...], total: 47, page: 2, totalPages: 3 }

Browser
  → Re-render les cartes utilisateurs en JS
  → Met à jour l'URL (pushState) pour que l'URL soit bookmarkable
```

### Flux 4 : Authentification (inscription)

```
Browser → POST /register { firstname, lastname, email, password, confirmPassword }
  → sanitizeHtml (strip tout HTML des champs)
  → authController.register()
    → Joi validation du schéma
    → User.findOne({ where: { email } }) → 409 si existe
    → argon2.hash(password) → hash de 97 chars
    → User.create({ ..., password: hash, role_id: 1 })
    → jwt.sign({ id, email, firstname, lastname }, JWT_SECRET, { expiresIn: '1h' })
    → res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'Strict' })
    → res.redirect('/onboarding')
```

---

## 6. Décisions non-évidentes

### "Pourquoi des migrations SQL brutes ET Sequelize ?"

Les fichiers `.sql` dans `/data/` (create_db, migration_v2, migration_v3) sont là depuis les débuts du projet (v1, avant l'adoption de Sequelize CLI). Les migrations Sequelize dans `/migrations/` sont le standard actuel. En production, seules les migrations Sequelize sont utilisées, mais les fichiers SQL restent utiles pour une installation fraîche ou du debug manuel.

### "Pourquoi `ENABLE_SEQUELIZE_SYNC=false` ?"

`sequelize.sync({ force: true })` recrée toutes les tables à chaque démarrage — catastrophique en production. La variable permet de désactiver complètement ce comportement et de forcer l'usage des migrations. Si on l'active par erreur en prod, toutes les données sont perdues.

### "Pourquoi offset-based pagination plutôt que cursor-based ?"

La pagination par offset (`LIMIT 20 OFFSET 40`) est simple à implémenter et à comprendre. Le curseur (`WHERE id > 423 LIMIT 20`) est plus performant sur de grandes tables mais complexifie l'API. Pour moins de 10 000 utilisateurs, l'offset est parfaitement adapté. C'est documenté comme dette technique à adresser si l'app passe à l'échelle.

### "Pourquoi `transports: ['websocket']` uniquement dans Socket.IO ?"

En développement local ou sur des réseaux instables, le polling HTTP serait une alternative automatique. Mais en production sur DigitalOcean avec Nginx qui supporte les WebSockets, le polling est inutile et consommateur. En forçant WebSocket uniquement, on élimine la complexité du fallback et on réduit les connexions HTTP superflues.

### "Pourquoi deux middlewares JWT séparés ?"

`verifyJWT` bloque si pas de token valide → pour les routes nécessitant une connexion (écriture, profil privé). `optionalJWT` passe quand même si pas de token → pour les routes publiques où on veut juste savoir *qui* consulte si c'est un utilisateur connecté (pour personnaliser l'UI, cacher le bouton "follow own profile", etc.).

### "Pourquoi `readyz` en plus de `healthz` ?"

Deux health checks distincts pour deux audiences :
- `healthz` répond "le processus Node est vivant" → utilisé par le gestionnaire de processus pour savoir s'il faut redémarrer.
- `readyz` vérifie aussi la connexion DB → utilisé par le load balancer pour savoir s'il faut envoyer du trafic. Si la DB est down, `readyz` retourne 503 et le LB redirige ailleurs, même si le processus Node est techniquement "en vie".

### "Pourquoi `LESSONS_LEARNED.md` dans le repo ?"

C'est un document de post-mortem continu : chaque bug corrigé, chaque refactoring, chaque décision technique est documenté avec le "pourquoi". En équipe, c'est une alternative légère à un wiki. En solo, c'est ce qui permet de reprendre un projet des mois plus tard sans tout réapprendre.

---

## Résumé pour une présentation technique

**Ce projet est un monolithe MVC Node.js classique, délibérément simple, avec une couche temps-réel greffée chirurgicalement là où elle apporte de la valeur.**

Chaque choix technologique favorise la productivité (Express, EJS, Bulma) sur la sophistication. La sécurité (Argon2, httpOnly cookies, CSP) est traitée sérieusement dès le départ. L'opérationnel (health checks, logging structuré, Sentry) permet un déploiement production-ready.

### Forces à revendiquer

- Architecture MVC claire avec séparation des responsabilités réelle (pas cosmétique)
- Sécurité OWASP-grade sur l'auth (Argon2, timing attacks, SameSite:Strict)
- Opérationnel sérieux : health checks, logging structuré, Sentry, request correlation
- Tests sur les couches critiques (sécurité, validation, sockets)
- `LESSONS_LEARNED.md` comme preuve de maturité d'ingénierie

### Dettes techniques à assumer honnêtement

| Dette | Impact | Solution future |
|-------|--------|-----------------|
| Pas de TypeScript | Sécurité de type runtime limitée | Migration progressive vers TS |
| Pagination offset-based | O(n) pour de grands offsets | Cursor-based pour 100K+ users |
| Pas de Redis | Pas de scaling WebSocket horizontal | Redis adapter pour Socket.IO |
| Pas de tests E2E | Couverture UI non automatisée | Playwright |
| Pas de cache | Chaque requête frappe la DB | Redis pour les requêtes fréquentes |
