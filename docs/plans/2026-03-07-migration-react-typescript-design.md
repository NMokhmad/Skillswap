# Design : Migration React + TypeScript

**Date :** 2026-03-07
**Branche :** `react+typescript`
**Statut :** Design approuvé ✅ (sections 1, 2, 3)

---

## Contexte

Skillswap est une application Express.js avec rendu EJS côté serveur. L'objectif est de migrer le frontend vers React 19 + TypeScript, tout en conservant le backend Express qui devient une API REST pure.

---

## Décisions prises

| Sujet | Décision |
|---|---|
| Stratégie de migration | Progressive (routes EJS + `/api/*` coexistent) |
| Architecture finale | API REST pure (Express JSON only) |
| Authentification | Cookies httpOnly (inchangé) |
| Data fetching | TanStack Query |
| State global | Zustand |
| Styling | CSS plain (migration des fichiers existants) |
| Router | React Router v7 |

---

## Section 1 — Architecture générale ✅

### Structure des fichiers

```
Skillswap/
├── index.js                  ← Express (inchangé au départ)
├── app/
│   ├── router.js             ← routes EJS + nouvelles routes /api/*
│   └── controllers/          ← retournent JSON via res.json()
├── views/                    ← EJS supprimées au fil de la migration
└── frontend/
    └── src/
        ├── main.tsx
        ├── App.tsx           ← routing React Router v7
        ├── api/              ← fonctions fetch (1 fichier par domaine)
        ├── stores/           ← Zustand (authStore, socketStore)
        ├── components/       ← Navbar, Footer
        └── pages/            ← une page = un dossier
```

### Flux de données

```
React (TanStack Query) → fetch /api/... → Express controller → JSON
                                    ↑
                           cookies httpOnly (auth)
```

### Stratégie progressive

Pour chaque page :
1. Ajouter une route `GET /api/<ressource>` dans Express retournant JSON
2. Créer le composant React correspondant consommant cette route
3. Tester
4. Supprimer la route EJS correspondante

---

## Section 2 — Backend ✅

### Modifications Express

**Une seule modification globale :** changer `CORS_ORIGIN` dans `.env` de `http://localhost:3000` → `http://localhost:5173`. Cela s'applique automatiquement à Express (createApp.js:71) et Socket.io (index.js:20).

**Pour chaque page migrée**, dans `router.js` :
```js
// Ajouter la route API (controller modifié pour res.json())
router.get("/api/talents", optionalJWT, talentController.getTalents);
// Supprimer la route EJS une fois la page React validée
```

Les helpers `isApiRequest` / `sendApiError` existent déjà dans `app/helpers/apiResponse.js` — l'infrastructure est prête.

### Auth

L'auth actuelle (JWT en cookies httpOnly) reste inchangée. Les endpoints `/api/auth/login` et `/api/auth/register` retournent JSON + posent le cookie.

### Socket.io

Aucun changement de code — la variable `CORS_ORIGIN` suffit.

---

## Section 3 — Frontend setup ✅

### Packages à installer

```bash
cd frontend
npm install @tanstack/react-query zustand
npm install -D @tanstack/react-query-devtools
```

### Structure `src/` cible

```
src/
├── api/
│   ├── auth.ts          ← fetch login, register, logout, me
│   ├── search.ts
│   ├── profil.ts
│   ├── messages.ts
│   └── ...
├── stores/
│   ├── authStore.ts     ← { user, isAuthenticated, login, logout }
│   └── socketStore.ts   ← { socket, connect, disconnect }
├── components/
│   ├── navbar.tsx       ← déjà commencé
│   ├── footer.tsx       ← déjà commencé
│   └── ProtectedRoute.tsx
├── pages/               ← un dossier par page
├── App.tsx              ← routing + layout
└── main.tsx             ← QueryClientProvider + StrictMode
```

### Détails clés

- `main.tsx` : corriger les imports CSS cassés (`./styles/navbar.css` → `./components/navbar.css`)
- Toutes les requêtes fetch avec `credentials: 'include'` (cookies httpOnly)
- TanStack Query configuré avec `defaultOptions` pour inclure credentials
- `<ProtectedRoute>` : redirect vers `/login` si non authentifié

---

## Ordre de migration des pages

| Priorité | Page | Complexité |
|---|---|---|
| 1 | Setup (App.tsx, stores, layout) | Moyen |
| 2 | Login / Register | Moyen |
| 3 | Help / Homepage | Simple |
| 4 | Search | Moyen |
| 5 | Profils | Moyen |
| 6 | Skills / Talents | Simple |
| 7 | Messages + Socket.io | Complexe |
| 8 | Notifications | Moyen |
| 9 | Onboarding | Simple |
| 10 | 404 / 500 | Simple |
