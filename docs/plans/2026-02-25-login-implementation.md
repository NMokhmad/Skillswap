# Login Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réécrire `views/pages/login.ejs` et `public/css/login.css` pour supprimer Bulma CSS et aligner sur l'esthétique "Noir Académique" — carte verre identique à register.

**Architecture:** Glass card centrée sur fond `#0C1E1C`, même pattern que register.css. Bandeau d'erreur global conditionnel, lien "Mot de passe oublié ?", séparateur "OU", lien /register. Aucun JS nécessaire.

**Tech Stack:** EJS, CSS pur (Flexbox, CSS Custom Properties), Font Awesome icons, Google Fonts

---

## Contexte important

- GET `/login` → `res.render('login', { title, cssFile: 'login' })` — pas d'erreurs initiales
- POST `/login` en échec → `res.render('login', { title, cssFile, error: 'Email ou mot de passe incorrect' })`
- Vérification EJS erreur : `<% if (typeof error !== 'undefined' && error) { %>`
- Champs : `name="email"` (type email) + `name="password"` (type password)
- Pas de `formData` à réafficher (pas de persistence sur login)
- Redirect `/` en cas de succès (géré côté serveur)
- `nonce="<%= cspNonce %>"` non nécessaire ici (pas de JS inline)
- Google Fonts importé dans le CSS

---

## Task 1 : Réécrire `public/css/login.css`

**Fichiers :**
- Modifier : `public/css/login.css`

**Step 1 : Remplacer tout le contenu de `public/css/login.css`**

```css
/* ====================================================
   SKILLSWAP — LOGIN PAGE (Pure CSS, no framework)
   CSS Custom Properties · Flexbox
==================================================== */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

:root {
    --login-bg:       #0C1E1C;
    --login-card-bg:  rgba(14, 34, 32, 0.72);
    --login-border:   rgba(212, 146, 42, 0.18);
    --login-amber:    #D4922A;
    --login-amber-h:  #E8A63C;
    --login-cream:    #F7F2E8;
    --login-cream-4:  rgba(247, 242, 232, 0.42);
    --login-cream-2:  rgba(247, 242, 232, 0.18);
    --login-error:    rgba(220, 80, 80, 0.85);
    --login-err-bg:   rgba(220, 80, 80, 0.10);
    --font-serif:     'Cormorant Garamond', Georgia, serif;
    --font-sans:      'Outfit', system-ui, sans-serif;
    --ease:           cubic-bezier(0.4, 0, 0.2, 1);
}

/* ─── Reset minimal ─── */
*, *::before, *::after { box-sizing: border-box; }

/* ─── Page ─── */
html, body {
    margin: 0;
    padding: 0;
    min-height: 100vh;
}

body {
    background-color: var(--login-bg);
    font-family: var(--font-sans);
    color: var(--login-cream);
}

body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
}

/* ─── Zone centrale ─── */
.ss-login-page {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
}

/* ─── Carte verre ─── */
.ss-login-card {
    width: min(440px, 100%);
    background: var(--login-card-bg);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid var(--login-border);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(212, 146, 42, 0.10);
}

/* ─── En-tête ─── */
.ss-login-header {
    text-align: center;
    margin-bottom: 2rem;
}

.ss-login-title {
    font-family: var(--font-serif);
    font-size: 2rem;
    font-weight: 600;
    font-style: italic;
    line-height: 1.1;
    color: var(--login-cream);
    margin: 0 0 0.5rem;
}

.ss-login-title em {
    font-style: italic;
    color: var(--login-cream);
}

.ss-login-title strong {
    font-style: normal;
    color: var(--login-amber);
}

.ss-login-subtitle {
    font-size: 0.82rem;
    color: var(--login-cream-4);
    margin: 0;
    letter-spacing: 0.04em;
}

/* ─── Séparateur décoratif (sous le header) ─── */
.ss-login-divider {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--login-amber), transparent);
    margin: 0 auto 1.75rem;
    border: none;
}

/* ─── Bandeau erreur global ─── */
.ss-login-error {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    background: var(--login-err-bg);
    border-left: 3px solid rgba(220, 80, 80, 0.55);
    border-radius: 0 8px 8px 0;
    padding: 0.75rem 1rem;
    margin-bottom: 1.25rem;
    font-size: 0.82rem;
    color: var(--login-error);
}

.ss-login-error i {
    font-size: 0.78rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
}

/* ─── Champ ─── */
.ss-login-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 1.25rem;
}

.ss-login-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(212, 146, 42, 0.75);
}

.ss-login-input-wrap {
    position: relative;
}

.ss-login-input-wrap i {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: var(--login-cream-2);
    pointer-events: none;
    transition: color 0.18s var(--ease);
}

.ss-login-input {
    width: 100%;
    background: rgba(247, 242, 232, 0.04);
    border: 1px solid rgba(247, 242, 232, 0.10);
    border-radius: 8px;
    padding: 0.7rem 0.9rem 0.7rem 2.5rem;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    color: var(--login-cream);
    outline: none;
    transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease), background 0.18s var(--ease);
}

.ss-login-input::placeholder {
    color: rgba(247, 242, 232, 0.22);
}

.ss-login-input:focus {
    border-color: rgba(212, 146, 42, 0.50);
    box-shadow: 0 0 0 3px rgba(212, 146, 42, 0.12);
    background: rgba(247, 242, 232, 0.06);
}

.ss-login-input-wrap:focus-within i {
    color: rgba(212, 146, 42, 0.60);
}

/* ─── Lien mot de passe oublié ─── */
.ss-login-forgot {
    text-align: right;
    margin-top: -0.75rem;
    margin-bottom: 1.5rem;
}

.ss-login-forgot a {
    font-size: 0.72rem;
    color: rgba(212, 146, 42, 0.60);
    text-decoration: none;
    transition: color 0.18s var(--ease);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
}

.ss-login-forgot a:hover {
    color: var(--login-amber);
}

.ss-login-forgot a i {
    font-size: 0.65rem;
}

/* ─── Bouton Submit ─── */
.ss-login-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    background: var(--login-amber);
    color: #071312;
    border: none;
    border-radius: 8px;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.ss-login-btn:hover {
    background: var(--login-amber-h);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212, 146, 42, 0.30);
}

.ss-login-btn:active {
    transform: translateY(0);
    box-shadow: none;
}

/* ─── Séparateur "OU" ─── */
.ss-login-or {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1.5rem 0;
}

.ss-login-or::before,
.ss-login-or::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(247, 242, 232, 0.10);
}

.ss-login-or span {
    font-size: 0.62rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(247, 242, 232, 0.28);
    white-space: nowrap;
}

/* ─── Lien inscription ─── */
.ss-login-register-link {
    text-align: center;
    font-size: 0.8rem;
    color: rgba(247, 242, 232, 0.36);
    margin: 0;
}

.ss-login-register-link a {
    color: var(--login-amber);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.18s var(--ease);
}

.ss-login-register-link a:hover {
    color: var(--login-amber-h);
    text-decoration: underline;
}

/* ─── Responsive ─── */
@media (max-width: 480px) {
    .ss-login-card {
        padding: 1.75rem 1.25rem;
    }

    .ss-login-title {
        font-size: 1.7rem;
    }
}

@media (max-width: 360px) {
    .ss-login-title {
        font-size: 1.5rem;
    }
}
```

**Step 2 : Vérifier que le fichier commence par `/* ====...`**

**Step 3 : Commit**

```bash
git add public/css/login.css
git commit -m "style(login): réécriture CSS — esthétique Noir Académique, suppression Bulma"
```

---

## Task 2 : Réécrire `views/pages/login.ejs`

**Fichiers :**
- Modifier : `views/pages/login.ejs`

**Step 1 : Éléments à préserver**

- `<%- include('../partials/header.ejs') %>` et `</head>`
- `<body>`, navbar et footer partials
- `action="/login" method="POST"` sur le formulaire
- `name="email"` (type email) et `name="password"` (type password)
- `<% if (typeof error !== 'undefined' && error) { %>` pour le bandeau erreur
- `<%= error %>` pour le message d'erreur du serveur

**Step 2 : Écrire le nouveau template**

Remplacer tout le contenu de `views/pages/login.ejs` par :

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
    <%- include('../partials/navbar.ejs') %>

    <div class="ss-login-page">
        <div class="ss-login-card">

            <!-- En-tête -->
            <div class="ss-login-header">
                <h1 class="ss-login-title">Bon retour sur <em>Skill</em><strong>Swap</strong></h1>
                <p class="ss-login-subtitle">Connectez-vous à votre compte</p>
            </div>

            <hr class="ss-login-divider">

            <!-- Bandeau erreur (conditionnel) -->
            <% if (typeof error !== 'undefined' && error) { %>
                <div class="ss-login-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span><%= error %></span>
                </div>
            <% } %>

            <!-- Formulaire -->
            <form action="/login" method="POST">

                <!-- Email -->
                <div class="ss-login-field">
                    <label class="ss-login-label" for="email">Email</label>
                    <div class="ss-login-input-wrap">
                        <input
                            class="ss-login-input"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="votre.email@exemple.com"
                            autocomplete="email"
                            required
                        >
                        <i class="fas fa-envelope"></i>
                    </div>
                </div>

                <!-- Mot de passe -->
                <div class="ss-login-field">
                    <label class="ss-login-label" for="password">Mot de passe</label>
                    <div class="ss-login-input-wrap">
                        <input
                            class="ss-login-input"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Votre mot de passe"
                            autocomplete="current-password"
                            required
                        >
                        <i class="fas fa-lock"></i>
                    </div>
                </div>

                <!-- Mot de passe oublié -->
                <div class="ss-login-forgot">
                    <a href="/forgot-password">
                        <i class="fas fa-question-circle"></i>
                        Mot de passe oublié ?
                    </a>
                </div>

                <!-- Bouton -->
                <button type="submit" class="ss-login-btn">
                    <i class="fas fa-arrow-right"></i>
                    Se connecter
                </button>

            </form>

            <!-- Séparateur OU -->
            <div class="ss-login-or">
                <span>OU</span>
            </div>

            <!-- Lien inscription -->
            <p class="ss-login-register-link">
                Pas encore de compte ? <a href="/register">Créez-en un</a>
            </p>

        </div><!-- /.ss-login-card -->
    </div><!-- /.ss-login-page -->

    <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 3 : Vérifier dans le navigateur**

Démarrer le serveur et naviguer vers `http://localhost:<PORT>/login` (déconnecté).

Vérifications :
- [ ] Page s'affiche avec fond sombre et carte centrée
- [ ] Focus sur Email → bordure amber + glow + icône amber
- [ ] Focus sur Password → même effet
- [ ] Lien "Mot de passe oublié ?" visible à droite, couleur amber pâle
- [ ] Bouton amber plein, hover lift
- [ ] Séparateur "OU" avec lignes latérales
- [ ] Lien "/register" en amber
- [ ] Soumettre avec mauvais identifiants → bandeau rouge en haut de la carte
- [ ] Bandeau rouge absent sur le GET initial
- [ ] Soumettre avec bons identifiants → redirect `/`
- [ ] Responsive 375px : carte pleine largeur

**Step 4 : Commit**

```bash
git add views/pages/login.ejs
git commit -m "feat(login): réécriture template — suppression Bulma, esthétique Noir Académique"
```

---

## Task 3 : Vérification finale

**Step 1 : Vérifier l'absence de classes Bulma**

```bash
grep -n "columns\|is-centered\|has-icons-left\|control\b\|\.field\b\|button\b\|is-left" views/pages/login.ejs
```

Résultat attendu : 0 résultats.

**Step 2 : Tester le cas d'erreur**

Soumettre le formulaire avec un email inexistant ou un mauvais mot de passe.
- [ ] Bandeau `.ss-login-error` apparaît avec le message "Email ou mot de passe incorrect"
- [ ] Les champs sont vides (normal — pas de `formData` sur login)

**Step 3 : Commit final**

```bash
git add -A
git commit -m "chore(login): vérification finale redesign — Noir Académique"
```

---

## Résumé des fichiers modifiés

| Fichier | Action |
|---------|--------|
| `public/css/login.css` | Réécriture complète |
| `views/pages/login.ejs` | Réécriture complète |
| `docs/plans/2026-02-25-login-design.md` | Créé (design doc) |
| `docs/plans/2026-02-25-login-implementation.md` | Créé (ce fichier) |
