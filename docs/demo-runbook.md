# Demo Runbook

## Objectif
Montrer rapidement les flux critiques de Skillswap en mode entretien/recruteur:
- login sécurisé,
- messagerie/notifications,
- recherche avancée,
- robustesse opérationnelle (health checks).

## Préparation (moins de 5 minutes)
1. `cp .env.templates .env` puis renseigner `JWT_SECRET` et `DATABASE_URL`.
2. `npm install`
3. `npm run demo:setup`
4. `npm run dev`
5. Vérifier `http://localhost:3000/healthz` et `http://localhost:3000/readyz`.

## Comptes de démo
Utiliser les comptes seedés dans `data/seeding_tables.sql` (emails existants).

Note: le script smoke protégé a besoin de:
- `DEMO_EMAIL`
- `DEMO_PASSWORD`

Exemple:
```bash
DEMO_EMAIL=user@example.com DEMO_PASSWORD=secret npm run demo:smoke
```

## Scénario de démo (ordre recommandé)
1. **Observabilité**
- Ouvrir `/healthz` et `/readyz` pour montrer l’état service et dépendance DB.

2. **Recherche avancée**
- Aller sur `/search`.
- Filtrer par texte + compétences + note + ville.
- Montrer tri `popular` et pagination.
- Sauvegarder une recherche (si connecté), puis la réappliquer.

3. **Messagerie temps réel**
- Ouvrir 2 sessions (2 navigateurs/comptes).
- Envoyer un message en direct.
- Montrer typing indicator et lecture (`message:read`).

4. **Notifications**
- Recevoir un message depuis une session non active.
- Vérifier badge navbar + dropdown + page `/notifications`.

## Vérifications rapides
1. `npm run test:all`
2. `npm run demo:smoke`

## Plan B (incident)
1. Si la DB est incohérente: `npm run demo:reset`.
2. Si websocket indisponible: montrer fallback HTTP sur `/messages/:userId` via submit formulaire.
3. Si login seed non fonctionnel: exécuter scénario public (`/search`, `/healthz`) puis expliquer les tests automatisés.
