# Architecture & Décisions Techniques — Skillswap

> Document de référence pour comprendre le *pourquoi* du projet, pas seulement le *quoi*.
> Rédigé pour permettre de présenter et défendre ces choix devant une équipe technique.
> Tout le code cité ici est extrait des fichiers réels du projet.

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

**La logique architecturale** : l'application est un **monolithe MVC server-rendered avec une couche temps-réel greffée dessus**. C'est une décision délibérée, pas un manque de recul :

- Tout vient du même serveur Express — pas de séparation API/frontend à maintenir
- Les pages HTML sont générées côté serveur avec EJS
- Socket.IO gère **uniquement** ce qui justifie du temps réel : la messagerie et les notifications
- Tout le reste passe par des formulaires HTML classiques avec redirections

**Pourquoi pas un SPA React + API REST séparée ?**

Pour un projet solo avec une audience modeste, un monolithe élimine une série de problèmes que le découplage aurait créés :

| Problème créé par un découplage | Solution apportée par le monolithe |
|--------------------------------|----------------------------------|
| Gérer CORS entre deux origines | Tout sur la même origine, CORS configuré une seule fois |
| Authentification dupliquée (cookie + token API) | Un seul cookie httpOnly couvre tout |
| Déployer et maintenir deux services | Un seul process Node, une seule pipeline CI |
| Hydratation et SEO à gérer côté React | SSR natif, HTML complet livré au premier octet |

La contrepartie assumée : chaque navigation recharge la page. Socket.IO compense exactement sur les cas où ça poserait vraiment problème (messagerie instantanée).

---

## 2. Choix structurels

```
app/
├── controllers/     ← Orchestration (reçoit, valide, délègue, répond)
├── models/          ← Représentation des données + associations (Sequelize)
├── middlewares/     ← Traitements transversaux (auth, sanitize, logging)
├── schemas/         ← Validation entrées (Joi) — isolée des controllers
├── helpers/         ← Utilitaires partagés sans état
├── sockets/         ← Logique temps-réel (séparée du cycle HTTP)
├── createApp.js     ← Usine Express (testable sans démarrer le serveur)
├── router.js        ← Table de routage centralisée et lisible
└── database.js      ← Connexion et export Sequelize
```

### Pourquoi `createApp.js` séparé de `index.js` ?

C'est le pattern **App Factory**. Le code réel :

```js
// index.js — démarre le serveur, crée Socket.IO, bind le port
const app = createApp();
const server = createServer(app);
const io = new Server(server, { ... });
server.listen(PORT, async () => { ... });

// createApp.js — configure Express, aucune mention de port ou de socket
export function createApp() {
  const app = express();
  // ... middlewares, routes, error handlers
  return app;
}
```

L'intérêt est direct : les tests d'intégration importent `createApp()` et obtiennent une instance Express configurée sans ouvrir de socket réseau. Sans ce découplage, chaque test démarrerait un vrai serveur sur un vrai port, ce qui génère des collisions et ralentit la suite.

### Pourquoi `schemas/` séparé des `controllers/` ?

La validation Joi est isolée pour deux raisons distinctes :

**1. Réutilisabilité testable** — les tests unitaires importent le schéma directement sans instancier un controller :

```js
// tests/validation.test.js — importe le schéma, pas le controller
import { userCreateSchema } from '../app/schemas/user.schema.js';

test('password trop court', async () => {
  await expect(userCreateSchema.validateAsync({ password: '123' }))
    .rejects.toThrow();
});
```

**2. Lisibilité des controllers** — sans ce découplage, `authController.register()` gérerait à la fois les règles métier de validation et l'orchestration. Le résultat serait illisible. Avec la séparation, chaque fichier a un périmètre clair : le schéma décrit *ce qui est valide*, le controller décide *quoi faire avec des données valides*.

### Pourquoi `sockets/messageHandler.js` séparé ?

La logique WebSocket est architecturalement différente du cycle HTTP :

| HTTP | WebSocket |
|------|-----------|
| `req` / `res` | `socket` (état persistant) |
| Stateless | Stateful (connexion ouverte) |
| Une requête → une réponse | Un événement → N émissions possibles |
| Middleware Express | Middleware Socket.IO (`io.use()`) |

Mélanger les deux dans `index.js` aurait produit un fichier de 400 lignes mélangeant des préoccupations incompatibles. `messageHandler.js` contient toute la logique événementielle : validation des payloads, persistance, émission aux participants, notification conditionnelle.

### Pourquoi `helpers/` ?

Trois utilitaires qui n'appartiennent à aucun controller spécifique mais sont utilisés de partout :

**`notificationHelper.js`** — utilisé depuis `followController`, `reviewController` et `messageHandler`. Si cette logique était dans l'un des controllers, les deux autres devraient l'importer depuis un endroit qui ne leur appartient pas. En helper, elle est neutre.

**`apiResponse.js`** — impose un contrat de réponse uniforme. Sans ça, chaque controller formaterait ses erreurs différemment. La détection "est-ce une requête API ?" est centralisée ici :

```js
export function isApiRequest(req) {
  if (req.path?.startsWith('/api/')) return true;
  const accept = String(req.headers.accept || '').toLowerCase();
  const contentType = String(req.headers['content-type'] || '').toLowerCase();
  return accept.includes('application/json') || contentType.includes('application/json');
}
```

Ce helper permet au gestionnaire d'erreurs global de décider seul s'il doit répondre en JSON ou rendre une page HTML d'erreur.

**`logger.js`** — logging structuré JSON utilisable dans les controllers, middlewares et sockets de façon homogène.

---

## 3. Choix technologiques

### Express.js (pas Fastify, pas NestJS)

Express est le choix le plus pragmatique pour un projet solo/MVP :

- **Documentation** : des années d'exemples, de réponses StackOverflow, de middleware compatibles
- **Transparence** : aucune abstraction cachée — ce qui est dans `createApp.js` est exactement ce qui s'exécute
- **Écosystème** : Helmet, express-rate-limit, method-override sont des paquets Express-natifs

Fastify serait ~2x plus rapide sur des benchmarks synthétiques mais ajouterait une courbe d'apprentissage sans gain réel sur une app à faible trafic. NestJS forcerait une structure qui apporte de la valeur en grande équipe mais du bruit en solo.

### Sequelize ORM (pas raw SQL, pas Prisma)

**Ce que Sequelize apporte concrètement ici :**

- Les requêtes paramétrées sont automatiques — impossible d'oublier d'échapper une valeur
- Les associations (`User.belongsToMany(Skill)`, etc.) éliminent les JOINs manuels répétitifs
- Les migrations versionnent le schéma comme du code, avec rollback possible

**Où Sequelize atteint ses limites dans ce projet :**

La recherche avancée requiert des sous-requêtes SQL que Sequelize ne génère pas proprement. La solution adoptée : des littéraux SQL injectés explicitement :

```js
// searchController.js — SQL brut là où Sequelize ne suffit pas
const AVG_RATING_SQL = 'COALESCE((SELECT AVG(r.rate)::numeric FROM "review" r WHERE r."reviewed_id" = "User"."id"), 0)';
const REVIEW_COUNT_SQL = '(SELECT COUNT(*) FROM "review" r WHERE r."reviewed_id" = "User"."id")';

// Utilisé comme colonne calculée
[sequelize.literal(AVG_RATING_SQL), 'average_rating']

// Utilisé dans HAVING pour filtrer par note minimale
having: sequelize.where(sequelize.literal(AVG_RATING_SQL), { [Op.gte]: minRating })
```

C'est le bon compromis : Sequelize pour 90% des requêtes simples, SQL brut ciblé pour les cas complexes.

### Argon2 (pas bcrypt)

Argon2id a remporté la Password Hashing Competition en 2015 et est la recommandation actuelle de l'OWASP. La différence clé avec bcrypt :

| | bcrypt | Argon2id |
|--|--------|----------|
| Type | CPU-bound | Memory-hard |
| GPU attack | Efficace | Très coûteux (nécessite de la RAM, pas seulement du calcul) |
| Paramètres | coût unique | m (mémoire), t (itérations), p (parallélisme) |

Le hash factice dans le projet illustre les paramètres réels utilisés :
```
$argon2id$v=19$m=65536,t=3,p=4$...
```
Soit : 64 Mo de RAM requis, 3 passes, 4 threads parallèles. Ces paramètres rendent une attaque GPU-parallèle extrêmement coûteuse.

### JWT dans un cookie httpOnly (pas localStorage)

Le problème de `localStorage` : c'est du JavaScript. N'importe quel script sur la page peut lire `localStorage.getItem('token')`. Une injection XSS (même mineure, même via une dépendance tierce) permet d'exfiltrer le token vers un serveur attaquant.

Un cookie `httpOnly` est **physiquement inaccessible** au JavaScript. Le navigateur l'envoie automatiquement sur chaque requête, mais aucun script ne peut le lire.

La configuration utilisée :
```js
res.cookie('token', token, {
  httpOnly: true,                                        // inaccessible au JS
  secure: process.env.NODE_ENV === 'production',        // HTTPS uniquement en prod
  sameSite: 'Strict'                                    // bloque les requêtes cross-origin
});
```

`SameSite: Strict` signifie que le cookie n'est envoyé que si l'origine de la requête est exactement le même domaine que le serveur. Cela rend les attaques CSRF impossibles sans avoir besoin de tokens CSRF dédiés.

### Socket.IO (pas WebSocket natif, pas SSE)

**Pourquoi pas les WebSockets natifs ?**
L'API native ne fournit ni rooms, ni reconnexion automatique, ni gestion des namespaces. Il faudrait maintenir manuellement une `Map<userId, Set<WebSocket>>` pour savoir à quelle connexion envoyer un message. Socket.IO gère ça avec `socket.join('user_42')` et `io.to('user_42').emit(...)`.

**Pourquoi pas les SSE (Server-Sent Events) ?**
Les SSE sont unidirectionnels : serveur → client seulement. Pour les notifications, ça suffirait. Mais pour la messagerie (le client envoie des messages, le serveur diffuse), il faudrait quand même une autre solution pour le canal montant. Socket.IO couvre les deux directions avec un seul protocole.

**Pourquoi `transports: ['websocket']` uniquement ?**
Socket.IO peut démarrer en polling HTTP puis upgrader vers WebSocket. En production sur DigitalOcean avec Nginx configuré pour les WebSockets, ce handshake en deux temps est inutile. Forcer `websocket` uniquement connecte directement, réduit la latence initiale et élimine les requêtes HTTP de polling superflues.

### EJS (pas React, pas Vue)

Le choix d'EJS est cohérent avec le modèle monolithe. Les pages sont rendues côté serveur, ce qui signifie :

- Le HTML complet est dans la réponse HTTP — pas de requête supplémentaire pour charger le contenu
- Les moteurs de recherche indexent le contenu directement (SEO pour les profils publics)
- Pas de build step (webpack, vite) à configurer et maintenir
- L'authentification est triviale : le controller vérifie le JWT avant de rendre la vue, pas de logique client-side

La contrepartie : les transitions entre pages rechargent le DOM entier. Socket.IO compense exactement là où ça poserait un problème UX réel.

### Bulma (pas Tailwind, pas Bootstrap)

Bulma est **purement CSS** — zéro JavaScript inclus. C'est important pour un projet qui gère son propre JavaScript et ne veut pas de conflits avec le JS de Bootstrap.

Tailwind CSS est plus puissant mais nécessite un build process (postcss + purge) pour ne pas livrer 3 Mo de CSS inutilisé en production. Pour ce projet sans bundler, Bulma est le bon équilibre : classes sémantiques lisibles, responsive mobile-first, flexbox natif.

### Joi (pas Zod, pas validation manuelle)

Joi est le standard historique de l'écosystème Node.js. Son avantage ici : les messages d'erreur détaillés par champ sont directement réutilisés pour pré-remplir le formulaire en cas d'échec :

```js
// authController.js — les erreurs Joi alimentent directement le template
if (error.isJoi) {
  const errors = {};
  error.details.forEach(err => {
    const field = err.path[0];   // 'password', 'email', etc.
    errors[field] = err.message; // message localisable
  });
  return res.render("register", { errors, formData: req.body });
}
```

Zod serait préférable en TypeScript (les types sont inférés depuis le schéma), mais ce projet est en JavaScript pur — le bénéfice principal de Zod disparaît.

---

## 4. Patterns et conventions

### Pattern MVC strict

Chaque couche a une responsabilité unique et non-négociable :

| Couche | Responsabilité | Ce qu'elle ne fait PAS |
|--------|---------------|----------------------|
| **Router** | Déclarer les routes et la chaîne de middleware | Aucune logique métier |
| **Middleware** | Un traitement transversal atomique | Accéder directement à la DB |
| **Controller** | Orchestrer (valider → modèle → répondre) | Contenir des règles SQL |
| **Model** | Définir la structure et les associations | Formater les réponses HTTP |

### L'ordre des middlewares dans `createApp.js` n'est pas anodin

```js
// createApp.js — l'ordre impose une séquence de traitement garantie
app.use(requestId);           // 1. UUID de traçabilité (en premier pour être dans tous les logs)
app.use(methodeOverride);     // 2. Permet DELETE/PUT depuis des formulaires HTML
app.use(express.json());      // 3. Parse le corps JSON
app.use(express.urlencoded);  // 4. Parse les formulaires HTML
app.use(sanitize);            // 5. Nettoie req.body et req.query (après parsing, avant usage)
app.use(cookieParser);        // 6. Parse les cookies (avant les controllers qui lisent le JWT)
app.use(cors);                // 7. Headers CORS
app.use(userInfo);            // 8. Peuple res.locals.user depuis le cookie (pour les templates)
app.use(requestLogger);       // 9. Log la requête (après userInfo pour avoir l'userId)
app.use(router);              // 10. Routes applicatives
```

Si `sanitize` était après `cookieParser`, on risquerait de sanitiser le cookie JWT. Si `requestLogger` était avant `userInfo`, le log n'aurait pas l'userId. L'ordre est fonctionnel, pas cosmétique.

### Middleware en chaîne sur les routes

```js
// router.js
router.post('/review/:userId', verifyJWT, reviewController.createReview)
```

Chaque middleware est atomique et réutilisable. On peut ajouter `uploadAvatar` ou `sanitize` ciblé sur une route spécifique sans toucher aux autres :

```js
router.route("/user/:id/profil")
  .get(verifyJWT, mainController.renderProfilePage)
  .post(verifyJWT, uploadAvatar, profilController.updateProfile)  // + upload sur POST uniquement
  .delete(verifyJWT, profilController.deleteProfile);
```

### Dual JWT middleware (`verifyJWT` vs `optionalJWT`)

Le code réel montre la différence de comportement :

```js
// jwtVerify.js
export const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    if (!apiRequest && req.method === 'GET') return res.redirect('/login');  // page → redirect
    return sendApiError(res, { status: 401, code: 'UNAUTHORIZED' });         // API → JSON 401
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('token');  // token corrompu → on le supprime proprement
    if (!apiRequest && req.method === 'GET') return res.redirect('/login');
    return sendApiError(res, { status: 403, code: 'FORBIDDEN' });
  }
};

export const optionalJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) { req.user = null; return next(); }  // pas de token → on continue sans bloquer
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    req.user = null;
    res.clearCookie('token');  // token expiré → nettoyage silencieux
  }
  next();  // toujours next(), quoi qu'il arrive
};
```

`optionalJWT` nettoie aussi silencieusement les cookies expirés sans bloquer l'utilisateur. Ça évite qu'un cookie expiré crée une boucle redirect/erreur sur les pages publiques.

### Validation Socket.IO séparée de la validation HTTP

Les payloads Socket.IO ne passent pas par les middlewares Express. Ils ont donc leur propre couche de validation dans `messageHandler.js` :

```js
// messageHandler.js — validation pure, sans dépendance Express
export function validateSendPayload(payload) {
  if (!payload || typeof payload !== 'object') return { ok: false, code: 'INVALID_PAYLOAD' };

  const receiverId = parsePositiveInt(payload.receiverId);
  if (!receiverId) return { ok: false, code: 'INVALID_RECEIVER' };

  const cleanedContent = typeof payload.content === 'string' ? payload.content.trim() : '';
  if (!cleanedContent) return { ok: false, code: 'EMPTY_CONTENT' };
  if (cleanedContent.length > 3000) return { ok: false, code: 'CONTENT_TOO_LONG' };

  return { ok: true, receiverId, cleanedContent, clientMessageId: ... };
}
```

Ces fonctions retournent un objet `{ ok, code }` — un pattern résultat typé sans exceptions. Elles sont exportées et testées unitairement dans `socketPayloadValidation.test.js`.

### Notification helper : couplage intentionnel

```js
// notificationHelper.js — DB + WebSocket atomiquement couplés
export async function createNotification({ userId, type, content, ... }) {
  const notification = await Notification.create({ user_id: userId, ... });

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
```

Ce couplage est intentionnel et défendable : une notification créée en DB sans émission WebSocket serait invisible jusqu'au prochain rechargement. Les deux opérations sont liées sémantiquement — les regrouper dans un helper garantit qu'on ne peut pas appeler l'une sans l'autre. Le `if (io)` permet l'usage en test sans instance Socket.IO.

### Dummy password hash contre les timing attacks

```js
// authController.js — toujours vérifier un hash, même si l'email n'existe pas
const DUMMY_PASSWORD_HASH = '$argon2id$v=19$m=65536,t=3,p=4$...';

const user = await User.findOne({ where: { email } });
const hashToVerify = user?.password || DUMMY_PASSWORD_HASH;
const passwordValid = await argon2.verify(hashToVerify, password);

if (!user || !passwordValid) {
  return res.render('login', { error: 'Email ou mot de passe incorrect' });
}
```

Sans cette protection : une requête avec email inexistant retourne en quelques ms (pas de hash à vérifier), une requête avec email existant prend ~200ms (Argon2 est lent par design). La différence de timing est mesurable par un script de reconnaissance. Avec le DUMMY_HASH, les deux cas prennent ~200ms identiques.

---

## 5. Flux de données

### Flux 1 : Consultation d'un profil public

```
Browser → GET /talents/42
  │
  ├─ [optionalJWT] lit req.cookies.token
  │    → si valide : req.user = { id, email, firstname, lastname }
  │    → si absent/expiré : req.user = null, clearCookie silencieux
  │
  ├─ [userInfo] peuple res.locals.user pour les templates EJS
  │
  ├─ [requestLogger] log { method: GET, path: /talents/42, userId: ... }
  │
  └─ talentController.renderTalentPage()
       → User.findByPk(42, { include: [Skills, Reviews, Role] })
       → si 404 : res.status(404).render('404')
       → res.render('talent.ejs', {
           user,           // profil affiché
           currentUser,    // visiteur connecté ou null
           title: '...'
         })
  │
  └─ HTML complet → Browser (SSR, pas de requête fetch supplémentaire)
```

### Flux 2 : Envoi d'un message (temps réel)

```
Browser (chat.js)
  └─ socket.emit('message:send', {
       receiverId: 7,
       content: 'Bonjour !',
       clientMessageId: 'tmp-1234'   // ID local pour UX optimiste
     })

Server (messageHandler.js)
  ├─ validateSendPayload(payload)
  │    → vérifie receiverId > 0, content non vide, length <= 3000
  │    → retourne { ok: true, receiverId: 7, cleanedContent: '...', clientMessageId: '...' }
  │
  ├─ User.findByPk(7)   → vérifie que le destinataire existe réellement
  │
  ├─ Message.create({ content, sender_id: socket.user.id, receiver_id: 7, is_read: false })
  │
  ├─ emitMessageToParticipants(io, toMessagePayload(message, clientMessageId))
  │    → io.to('user_${socket.user.id}').emit('message:new', payload)  ← expéditeur
  │    → io.to('user_7').emit('message:new', payload)                   ← destinataire
  │
  └─ isUserActiveInConversation(io, 7, socket.user.id)
       → si false : createNotification({ userId: 7, type: 'message', ... })
                     → Notification.create() en DB
                     → io.to('user_7').emit('notification', { ... })
       → si true  : pas de notification (il voit déjà le message en temps réel)

Browser expéditeur (chat.js)
  └─ reçoit 'message:new' → remplace le message "en attente" par le message confirmé

Browser destinataire (socket.js)
  ├─ si dans la conversation → reçoit 'message:new' → chat.js ajoute le message
  └─ si ailleurs → reçoit 'notification' → toast + badge +1 dans le header
```

### Flux 3 : Recherche avancée avec filtres combinés

```
Browser (search.js)
  └─ fetch('/api/search/talents?q=Thomas&skills[]=3&min_rating=4&sort=popular&page=2')

Server (searchController.js)
  ├─ Parsing et normalisation des paramètres :
  │    page = 2, limit = 9, offset = 9
  │    q = 'Thomas', city = '', skills = [3], sort = 'popular', minRating = 4
  │
  ├─ Construction du WHERE Sequelize :
  │    where = { [Op.or]: [
  │      { firstname: { [Op.iLike]: '%Thomas%' } },
  │      { lastname:  { [Op.iLike]: '%Thomas%' } }
  │    ]}
  │
  ├─ Calcul du total (avec HAVING si minRating > 0) :
  │    User.findAll({ attributes: ['id'], group: ['User.id'],
  │      having: sequelize.where(literal(AVG_RATING_SQL), { [Op.gte]: 4 }) })
  │    → total = 23
  │
  ├─ Requête principale (IDs + scores) :
  │    User.findAll({
  │      attributes: ['id', [literal(AVG_RATING_SQL), 'average_rating'], [literal(REVIEW_COUNT_SQL), 'review_count']],
  │      include: [{ model: Skill, where: { id: [3] }, required: true }],
  │      group: ['User.id'],
  │      having: ...,
  │      order: [[literal(AVG_RATING_SQL), 'DESC'], [literal(REVIEW_COUNT_SQL), 'DESC']],
  │      limit: 9, offset: 9
  │    })
  │    → ids = [12, 7, 31, ...]
  │
  ├─ Requête d'enrichissement (données complètes pour les IDs trouvés) :
  │    User.findAll({ where: { id: { [Op.in]: ids } },
  │      include: [{ model: Skill, attributes: ['id', 'label', 'slug'] }] })
  │
  ├─ Reconstitution dans l'ordre du tri (Map pour performance) :
  │    const userMap = new Map(users.map(u => [u.id, u]))
  │    const results = ids.map(id => ({ ...userMap.get(id), ...ratingsMap.get(id) }))
  │
  └─ sendApiSuccess(res, { page: 2, limit: 9, total: 23, totalPages: 3, results: [...] })

Browser
  ├─ Re-render les cartes utilisateurs en JS sans rechargement
  └─ history.pushState({}, '', '?q=Thomas&skills[]=3&...') → URL bookmarkable
```

### Flux 4 : Authentification complète (inscription)

```
Browser → POST /register
  body: { firstname, lastname, email, password, confirmPassword }
  │
  ├─ [sanitize] strip tout HTML de req.body
  │    ex: '<script>alert(1)</script>' → '' (allowedTags: [] signifie zéro tag autorisé)
  │
  └─ authController.register()
       │
       ├─ Joi validation (abortEarly: false → collecte TOUTES les erreurs)
       │    → si invalide : res.render('register', { errors, formData })
       │       ↑ les erreurs par champ sont injectées dans le template EJS
       │
       ├─ User.findOne({ where: { email } })
       │    → si existe : res.render('register', { errors: { email: '...' } })
       │
       ├─ argon2.hash(password)
       │    → hash Argon2id ~200ms, paramètres m=65536 t=3 p=4
       │    → résultat : chaîne de ~97 caractères commençant par $argon2id$
       │
       ├─ User.create({ firstname, lastname, email, password: hashedPassword })
       │    → INSERT avec role_id DEFAULT 1 (rôle "user")
       │
       ├─ jwt.sign({ id, email, firstname, lastname }, JWT_SECRET, { expiresIn: '1h' })
       │
       ├─ res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' })
       │    → cookie invisible au JS, HTTPS uniquement en prod, bloque les requêtes cross-origin
       │
       └─ res.redirect('/onboarding')
            → l'onboarding est protégé par verifyJWT : le cookie vient d'être posé, ça passe
```

---

## 6. Décisions non-évidentes

### "Pourquoi des migrations SQL brutes ET Sequelize ?"

Deux systèmes coexistent pour des raisons historiques documentées :

- `/data/create_db.sql`, `migration_v2.sql`, `migration_v3.sql` : créés avant l'adoption de Sequelize CLI (v1 du projet en raw SQL)
- `/migrations/` : système actuel via Sequelize CLI

En production, **seules les migrations Sequelize sont utilisées** (`npm run migrate`). Les fichiers SQL restent pour deux usages légitimes : installation fraîche en une seule commande pour un nouveau développeur, et debug manuel d'un problème de schéma directement en psql.

Ce n'est pas de la dette — c'est une cohabitation avec la progression du projet, documentée et assumée.

### "Pourquoi `ENABLE_SEQUELIZE_SYNC=false` par défaut ?"

`sequelize.sync()` recrée les tables depuis les modèles JavaScript. Avec `force: true`, il DROP les tables existantes avant. Le code `index.js` le montre :

```js
if (process.env.ENABLE_SEQUELIZE_SYNC === 'true') {
  await sequelize.sync();
  logger.warn('database_sync_enabled', { env: process.env.NODE_ENV });  // ← c'est un WARN
}
```

Le `logger.warn` n'est pas anodin : activer le sync est considéré comme un état anormal en prod. La variable est en `false` par défaut pour rendre l'activation explicite et traçable dans les logs. L'activer accidentellement en production détruirait les données — la friction d'activation est voulue.

### "Pourquoi offset-based pagination plutôt que cursor-based ?"

La pagination par offset : `LIMIT 9 OFFSET 18` est simple à implémenter, à tester et à exposer dans une URL (`?page=3`). L'URL est bookmarkable et partageable.

La pagination par curseur (`WHERE id > 423 LIMIT 9`) est plus performante sur de grandes tables (pas de SKIP de N lignes), mais elle impose un format d'URL non-lisible et ne permet pas de sauter à une page arbitraire.

**Pour moins de 10 000 utilisateurs, la différence de performance est imperceptible.** PostgreSQL optimise les petits offsets efficacement. C'est une dette technique documentée à adresser si l'application passe à l'échelle — pas une erreur de conception.

### "Pourquoi la recherche fait deux requêtes séparées au lieu d'une ?"

Le `searchController.searchTalents` fait d'abord une requête pour les IDs + scores, puis une deuxième pour les données enrichies des IDs trouvés :

```js
// Requête 1 : IDs + scores agrégés (GROUP BY, HAVING, ORDER BY)
const baseRows = await User.findAll({ attributes: ['id', avgRating, reviewCount], group: ['User.id'], ... });
const ids = baseRows.map(row => row.id);

// Requête 2 : données complètes pour ces IDs (avec leurs skills)
const users = await User.findAll({ where: { id: { [Op.in]: ids } }, include: [Skill], ... });
```

C'est une solution au **problème N+1 inversé** : si on faisait un seul `findAll` avec `GROUP BY`, `HAVING`, `ORDER BY` ET `include: [Skill]`, Sequelize générerait une requête SQL invalide (on ne peut pas `include` avec `group` sur Sequelize sans précautions). La séparation en deux requêtes est un workaround documenté de Sequelize, pas une inefficacité.

### "Pourquoi `isUserActiveInConversation` avant de notifier ?"

```js
// messageHandler.js
const receiverIsActive = isUserActiveInConversation(io, parsedReceiverId, socket.user.id);
if (!receiverIsActive) {
  await createNotification({ userId: parsedReceiverId, type: 'message', ... });
}
```

Si le destinataire a la conversation ouverte (il voit le message arriver en temps réel via `message:new`), créer une notification "Vous avez un nouveau message" est redondant et pollue son centre de notifications. La fonction inspecte `socket.data.activeConversationUserId` sur les sockets actifs du destinataire pour savoir s'il est "dans" la conversation.

```js
function isUserActiveInConversation(io, userId, otherUserId) {
  const room = io.sockets.adapter.rooms.get(`user_${userId}`);
  if (!room) return false;
  for (const socketId of room) {
    const userSocket = io.sockets.sockets.get(socketId);
    if (userSocket?.data?.activeConversationUserId === otherUserId) return true;
  }
  return false;
}
```

Cette logique est testable (les fonctions sont exportées) et couvre le cas multi-onglets : si l'utilisateur a deux onglets ouverts, on vérifie chaque socket.

### "Pourquoi `readyz` en plus de `healthz` ?"

Deux health checks pour deux audiences différentes :

- **`/healthz`** (liveness) : "le process Node répond". Retourne `{ status: 'ok' }` immédiatement. Utilisé par le gestionnaire de process (PM2, Docker) pour décider de redémarrer.
- **`/readyz`** (readiness) : "le service peut traiter du trafic". Vérifie aussi la connexion à la DB avec `sequelize.authenticate()`. Retourne 503 si la DB est inaccessible. Utilisé par le load balancer pour décider d'envoyer des requêtes.

La distinction est critique : un processus peut être vivant (liveness OK) mais incapable de traiter des requêtes (DB down, readiness KO). Sans les deux endpoints, un load balancer enverrait du trafic sur un serveur qui va échouer sur chaque requête DB.

### "Pourquoi `method-override` ?"

Les formulaires HTML ne supportent que GET et POST. Pour implémenter DELETE sur `/user/:id/profil` depuis un formulaire, `method-override` lit le champ caché `_method` :

```html
<form method="POST" action="/user/42/profil?_method=DELETE">
  <input type="hidden" name="_method" value="DELETE">
</form>
```

Ça permet d'utiliser les verbes HTTP sémantiques (DELETE pour supprimer, PUT pour modifier) sans JavaScript côté client — cohérent avec l'approche "formulaires HTML classiques" du projet.

---

## Résumé pour une présentation technique

**Ce projet est un monolithe MVC Node.js classique, délibérément simple, avec une couche temps-réel greffée chirurgicalement là où elle apporte de la valeur.**

Chaque choix technologique favorise la productivité (Express, EJS, Bulma) sur la sophistication. La sécurité (Argon2, httpOnly cookies, CSP, timing attacks) est traitée sérieusement dès le départ, pas ajoutée en dernière minute. L'opérationnel (health checks séparés liveness/readiness, logging structuré JSON, Sentry, request correlation) permet un déploiement production-ready.

### Forces à revendiquer

- Architecture MVC avec séparation des responsabilités réelle, visible dans chaque fichier
- Sécurité OWASP-grade : Argon2id, cookie httpOnly + SameSite:Strict, dummy hash timing attack, sanitize HTML récursif, CSP avec nonce
- Opérationnel sérieux : `/healthz` + `/readyz` distincts, logging JSON structuré, Sentry optionnel, request correlation par UUID
- Tests sur les couches critiques : JWT middleware, validation Joi, timing attack, validation Socket.IO payloads
- `LESSONS_LEARNED.md` qui trace l'évolution du projet et les décisions corrigées — preuve de maturité d'ingénierie

### Dettes techniques assumées et documentées

| Dette | Pourquoi c'est OK maintenant | Quand adresser |
|-------|------------------------------|----------------|
| Pas de TypeScript | JavaScript suffisant pour ce scope solo | Migration progressive Prisma+TS en cours |
| Pagination offset-based | Imperceptible sous 10 000 utilisateurs | Cursor-based si trafic significatif |
| Pas de Redis | Single server, pas de scaling horizontal nécessaire | Requis si scaling WebSocket multi-instance |
| Pas de tests E2E | Couverture unitaire + intégration sur les flux critiques | Playwright quand UX stabilisée |
| Pas de cache applicatif | Chaque requête frappe la DB — acceptable au trafic actuel | Redis si requêtes répétitives identifiées en prod |
