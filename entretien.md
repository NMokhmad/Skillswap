# Guide d'entretien technique (profil junior) — SkillSwap

## 1) Pitch court (30 secondes)

SkillSwap est une plateforme d'échange de compétences.  
J'ai conçu et implémenté une application full-stack web avec Node.js/Express, PostgreSQL, Sequelize, EJS et Socket.IO.

J'ai livré un périmètre produit complet :
- authentification sécurisée,
- profils, reviews, follow,
- notifications temps réel,
- messagerie instantanée,
- recherche avancée avec filtres et recherches sauvegardées.

Mon approche :
- sécurité par défaut,
- architecture lisible et maintenable,
- montée progressive de la complexité : HTTP robuste d'abord, temps réel ensuite.

---

## 2) Contexte projet et objectifs techniques

### Contexte

- Application communautaire orientée interactions sociales.
- Besoin de features synchrones (pages classiques) et asynchrones (chat/notifs live).
- Équipe/temps contraints : priorité à la valeur produit et à la stabilité.

### Objectifs techniques explicites

- Livrer vite sans dette technique explosive.
- Garantir l'intégrité des données côté DB, pas uniquement côté code.
- Conserver une base lisible pour des profils junior/mid.
- Ajouter le temps réel sans casser l'existant.
- Documenter les migrations pour éviter les dérives d'environnement.

---

## 3) Architecture : décision, justification, compromis

### Décision prise

- Architecture MVC côté serveur :
  - `controllers/` = use cases,
  - `models/` = mapping DB,
  - `middlewares/` = sécurité/validation/transversal,
  - `helpers/` = logique partagée,
  - `sockets/` = logique realtime.
- Rendu serveur EJS + enrichissement JS ciblé.

### Pourquoi ce choix est défendable

- Réduction du coût cognitif par rapport à un split SPA + API.
- Déploiement/monitoring plus simples (1 app principale).
- SEO correct et initial render rapide.
- Très adapté pour une équipe qui veut itérer vite.

### Alternatives envisagées

- SPA React + API REST dédiée :
  - Avantage : découplage front/back fort.
  - Inconvénient : coût de mise en place plus élevé pour le scope.
- Architecture microservices :
  - Surdimensionnée pour le volume attendu.

### Compromis assumés

- UI moins "app-like" qu'une SPA complète.
- Plus de responsabilités côté serveur.
- Refactor possible plus tard vers API-first si la taille produit augmente.

---

## 4) Choix de stack : argumentaire précis

### Node.js + Express

- Très bon fit pour I/O et websocket.
- Écosystème mature.
- Productivité élevée pour un MVP évolutif.

### PostgreSQL

- Transactions, contraintes relationnelles solides.
- Qualité des types (JSONB, TIMESTAMPTZ).
- Fiable pour logique métier orientée relation (users/messages/reviews/follows).

### Sequelize

- Gain de vitesse de dev sur CRUD/associations.
- Possibilité de descendre en SQL ciblé quand nécessaire (`literal`).
- Bon compromis entre abstraction et contrôle.

### EJS + Bulma + JS natif

- Templating simple, lisible, rapide à modifier.
- Pas de surcharge tooling front.
- JS natif utilisé uniquement sur les features qui en ont besoin : chat, recherche dynamique, badges live.

---

## 5) Design data model : comment le défendre

### Principes de conception

- La DB garantit la cohérence métier :
  - `UNIQUE`,
  - `CHECK`,
  - `FK` avec `ON DELETE CASCADE`.
- Les colonnes de tracking sont normalisées (`created_at`, `updated_at`).

### Évolutions importantes phase 2/3

- `notification` :
  - `is_read` pour statut lu/non lu,
  - `related_entity_type` + `related_entity_id` pour rattacher la notif à une entité métier,
  - `action_url` pour deep-link UX.
- `message` :
  - `is_read`,
  - `read_at` pour accusé de lecture exploitable.
- `saved_search` :
  - table dédiée avec `filters` JSONB pour sérialiser les filtres utilisateur.
- `user.city` :
  - ajout minimal nécessaire pour le filtre géographique.

### Pourquoi c'est pertinent

- Les champs ajoutés sont directement mappés à une valeur produit.
- Pas de sur-ingénierie : chaque colonne répond à un use case explicite.
- Le modèle reste extensible sans casser les routes existantes.

---

## 6) Sécurité : défense par couches

### Couches mises en place

- Auth :
  - JWT en cookie `httpOnly`,
  - `sameSite=Strict`,
  - middleware `verifyJWT` et `optionalJWT`.
- Secrets utilisateurs :
  - mot de passe haché avec Argon2.
- Surface d'attaque HTTP :
  - Helmet + CSP,
  - rate limiting global + auth.
- Entrées utilisateur :
  - sanitization HTML,
  - validation structurée.
- Actions sensibles :
  - logout en POST.

### Comment le dire en entretien

"J'applique une défense en profondeur : même si une couche est contournée, les autres protègent encore l'application."

### Points encore à améliorer (honnêteté)

- durcir SSL DB en prod (`rejectUnauthorized: true` + CA),
- réduire la surface timing attack au login.

---

## 7) Temps réel : stratégie d'intégration

### Objectif

Ajouter du live sans rendre l'app dépendante uniquement du websocket.

### Stratégie retenue

- Socket.IO branché au-dessus du socle HTTP existant.
- Les routes HTTP restent la source de fallback.
- Rooms par utilisateur : `user_${id}`.

### Événements implémentés

- Notifications :
  - émission ciblée après insertion DB.
- Messagerie :
  - `message:send`,
  - `message:new`,
  - `message:typing`,
  - `message:read`,
  - `messages:read:ack`.

### Règle métier importante

- Si destinataire actif dans la conversation :
  - pas de notification "nouveau message".
- Sinon :
  - notification créée et pushée temps réel.

### Pourquoi ce choix est robuste

- UX en temps réel quand possible.
- Dégradation propre si websocket indisponible.
- Cohérence des données maintenue côté DB.

---

## 8) Recherche avancée : défense technique

### Besoin produit

- Recherche multi-critères :
  - texte,
  - compétences multiples,
  - ville,
  - note minimale,
  - tri métier,
  - pagination.

### Conception API

- `GET /api/search/talents` pour résultats paginés.
- `GET /api/search/autocomplete` (max 5 suggestions).
- `POST/GET/DELETE /api/search/saved...` pour persistance des recherches.

### Conception requête SQL

- Construction dynamique de :
  - `where`,
  - `include`,
  - `group`,
  - `having`,
  - `order`.
- Tri `popular` explicite :
  - `AVG(rate) DESC`,
  - puis `COUNT(reviews) DESC`.

### Choix UX

- fetch sans reload,
- debounce 300ms,
- navigation clavier sur autocomplete.

---

## 9) Migrations et fiabilité d'environnement

### Incident réel rencontré

- `sequelize.sync({ alter: true })` sur base existante a provoqué une erreur de contrainte (`updated_at` NULL sur `role`).

### Décision prise

- retrait de `alter` en dev,
- stratégie migrations SQL explicites :
  - `migration_v2.sql` pour notifications,
  - `migration_v3.sql` pour `read_at`, `city`, `saved_search`.

### Message entretien fort

"Je suis passé d'une logique 'ça marche localement' à une logique 'ça migre proprement sur des données réelles'."

---

## 10) Qualité logicielle et maintenance

### Ce qui est en place

- tests unitaires existants maintenus verts pendant les refactors (42/42),
- séparation de responsabilités claire :
  - helper notif,
  - handler socket,
  - controller search.
- code orienté lisibilité et maintenance.

### Ce qui manque encore

- tests d'intégration bout-en-bout (Supertest + DB test),
- observabilité plus avancée (logs structurés, métriques).

---

## 11) Performance : arguments concrets

### Côté DB

- index sur FK critiques (reviews/messages/notifications/saved_search).
- pagination sur les listes volumineuses.

### Côté app

- limitation des requêtes inutiles (éviter patterns N+1 sur chemin principal).
- rafraîchissement ciblé des badges et données dynamiques.

### Côté UX

- rendu initial serveur rapide,
- updates incrémentaux via JS/socket plutôt que reload complet.

---

## 12) Points faibles assumés (à présenter proprement)

- Mélange partiel FR/EN dans le naming.
- Pas encore de suite d'intégration complète.
- Certaines réponses d'erreurs peuvent encore être harmonisées.

### Formulation entretien recommandée

"Je sais identifier mes limites techniques et je les transforme en plan d'action priorisé."

---

## 13) Plan d'amélioration crédible

- ajouter tests d'intégration API critiques (auth, messagerie, recherche),
- centraliser davantage la gestion des erreurs applicatives,
- renforcer monitoring,
- normaliser conventions de nommage,
- poursuivre l'industrialisation des migrations.

---

## 14) Questions fréquentes + réponses prêtes

### "Pourquoi EJS et pas React ?"

Parce que pour ce scope, l'objectif était la vitesse de livraison et la robustesse serveur.  
J'ai réservé le JS dynamique aux zones où il apporte une vraie valeur (chat/recherche/notifs).

### "Pourquoi garder HTTP avec Socket.IO ?"

Pour avoir une architecture résiliente : le websocket améliore l'UX, l'HTTP garantit la continuité de service.

### "Comment garantis-tu la cohérence des données ?"

Par les contraintes DB en premier, puis validation applicative.  
Je n'ai pas mis toute la confiance dans le front ou uniquement dans l'ORM.

### "Comment as-tu géré les incidents de migration ?"

J'ai identifié que `alter` créait de l'imprévisibilité sur base existante, puis j'ai basculé sur migrations SQL versionnées et documentées.

### "Si tu avais 2 semaines de plus ?"

Je prioriserais tests d'intégration, observabilité, et durcissement sécurité SSL DB.

---

## 15) Version 2 minutes (discours complet)

"J'ai conçu SkillSwap comme une application web pragmatique et évolutive.  
J'ai démarré avec une architecture MVC claire pour livrer rapidement les fonctionnalités cœur, puis j'ai ajouté progressivement la complexité : notifications temps réel, messagerie websocket, recherche avancée et recherches sauvegardées.  
Sur la base de données, j'ai fait des choix orientés fiabilité avec PostgreSQL et des contraintes fortes pour garantir l'intégrité métier.  
J'ai aussi pris en compte les enjeux de sécurité avec JWT en cookie httpOnly, Argon2, CSP, sanitization et rate limiting.  
Un point important de maturité a été la gestion des migrations : après un incident réel avec `sync({ alter: true })`, j'ai stabilisé la stratégie avec des migrations SQL explicites.  
Aujourd'hui, l'application est fonctionnelle, maintenable, et j'ai une roadmap claire pour monter encore en qualité sur les tests d'intégration et l'observabilité." 
