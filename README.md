## Étape 1 : Installer les dépendances

À la racine du projet, lancez la commande suivante pour installer les modules nécessaires :

```bash
npm install
```

---

## Étape 2 : Créer la base de données PostgreSQL

1. **Se connecter à PostgreSQL en tant que super-utilisateur** :

```bash
sudo -i -u postgres psql
```

Vous devriez voir l'invite suivante :

```
postgres=#
```

2. **Créer un utilisateur** :

```sql
CREATE ROLE skillswap WITH LOGIN PASSWORD 'skillswap';
```

3. **Créer la base de données** :

```sql
CREATE DATABASE skillswap OWNER skillswap;
```

Cela crée une base `skillswap` appartenant à l'utilisateur `skillswap`, avec tous les droits nécessaires.

4. **Quitter psql** :

```bash
Ctrl + D
```

---

## Étape 3 : Tester la connexion

Reconnectez-vous à PostgreSQL avec le nouvel utilisateur :

```bash
psql -U skillswap -d skillswap
```

Tapez le mot de passe (`skillswap`) lorsque demandé. Si tout fonctionne, vous devriez voir :

```
skillswap=>
```

Quittez avec `Ctrl + D`.

---

## Étape 4 : Exécuter les scripts SQL

Importez les fichiers SQL depuis le dossier `data` :

```bash
psql -U skillswap -d skillswap -f data/create_db.sql
psql -U skillswap -d skillswap -f data/seeding_tables.sql
```

⚠️ Vérifiez les chemins si vous n'êtes pas à la racine du projet.

---

## Étape 5 : Configurer les variables d’environnement

Créez un fichier `.env` à la racine du projet et copiez-y le contenu du fichier `.env.template`, en l’adaptant si besoin (nom de la base, user, mot de passe…).

---

## Étape 6 : Démarrer le projet

Lancez le serveur en mode développement avec :

```bash
npm run dev
```

---

## (Optionnel) Réinitialiser la base de données

Une fois la configuration en place, vous pouvez tout réinitialiser via un seul script :

```bash
npm run db:reset
```

Ce script exécute :

- `npm run db:create`
- `npm run db:seed`

Assurez-vous que ces commandes sont bien définies dans votre `package.json`.

---

✅ Le projet est maintenant prêt à être utilisé en local !