# Register Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réécrire `views/pages/register.ejs` et `public/css/register.css` pour supprimer Bulma CSS et aligner sur l'esthétique "Noir Académique" du reste du site.

**Architecture:** Carte centrée sur fond sombre `#0C1E1C`, effet verre (`backdrop-filter: blur`), champs Nom/Prénom côte à côte, barre de force du mot de passe + critères en JS pur, aucune dépendance framework.

**Tech Stack:** EJS, CSS pur (Grid, Flexbox, CSS Custom Properties), JS vanilla (inline, noncé CSP)

---

## Contexte important

- Le serveur rend la page avec `res.render('pages/register', { title, cssFile: 'register', errors, formData })`
- `errors` est un objet avec clés `lastname`, `firstname`, `email`, `password`, `confirmPassword` (ou `null`)
- `formData` contient les valeurs à réafficher en cas d'erreur
- La page inclut navbar + footer via partials
- Le fichier `views/partials/header.ejs` charge `/css/<%= cssFile %>.css` automatiquement
- Font Awesome est chargé globalement
- Google Fonts (Cormorant Garamond + Outfit) doit être importé dans le CSS

---

## Task 1 : Réécrire `public/css/register.css`

**Fichiers :**
- Modifier : `public/css/register.css`

**Step 1 : Ouvrir le fichier actuel et noter ce qui est supprimé**

Le fichier actuel (`public/css/register.css`) utilise une palette rose/violet (`#ff6b9d`, `#30293d`, `#ffd700`) incompatible. Il sera entièrement remplacé.

**Step 2 : Écrire le nouveau CSS**

Remplacer tout le contenu de `public/css/register.css` par :

```css
/* ====================================================
   SKILLSWAP — REGISTER PAGE (Pure CSS, no framework)
   CSS Custom Properties · Flexbox · Grid
==================================================== */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

:root {
    --reg-bg:        #0C1E1C;
    --reg-card-bg:   rgba(14, 34, 32, 0.72);
    --reg-border:    rgba(212, 146, 42, 0.18);
    --reg-amber:     #D4922A;
    --reg-amber-h:   #E8A63C;
    --reg-cream:     #F7F2E8;
    --reg-cream-4:   rgba(247, 242, 232, 0.42);
    --reg-cream-2:   rgba(247, 242, 232, 0.18);
    --reg-error:     rgba(220, 80, 80, 0.85);
    --reg-error-bg:  rgba(220, 80, 80, 0.10);
    --font-serif:    'Cormorant Garamond', Georgia, serif;
    --font-sans:     'Outfit', system-ui, sans-serif;
    --ease:          cubic-bezier(0.4, 0, 0.2, 1);
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
    background-color: var(--reg-bg);
    font-family: var(--font-sans);
    color: var(--reg-cream);
}

/* Motif grain sur le fond */
body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 0;
}

/* ─── Zone centrale ─── */
.ss-reg-page {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 120px); /* espace pour navbar+footer */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
}

/* ─── Carte verre ─── */
.ss-reg-card {
    width: min(500px, 100%);
    background: var(--reg-card-bg);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid var(--reg-border);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(212, 146, 42, 0.10);
}

/* ─── En-tête ─── */
.ss-reg-header {
    text-align: center;
    margin-bottom: 2rem;
}

.ss-reg-title {
    font-family: var(--font-serif);
    font-size: 2.2rem;
    font-weight: 600;
    font-style: italic;
    line-height: 1.1;
    color: var(--reg-cream);
    margin: 0 0 0.5rem;
}

.ss-reg-title em {
    font-style: italic;
    color: var(--reg-cream);
}

.ss-reg-title strong {
    font-style: normal;
    color: var(--reg-amber);
}

.ss-reg-subtitle {
    font-size: 0.82rem;
    color: var(--reg-cream-4);
    margin: 0;
    letter-spacing: 0.04em;
}

/* ─── Grille 2 colonnes (Nom + Prénom) ─── */
.ss-reg-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

/* ─── Champ ─── */
.ss-reg-field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 1.25rem;
}

.ss-reg-field:last-of-type {
    margin-bottom: 0;
}

.ss-reg-label {
    font-size: 0.68rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(212, 146, 42, 0.75);
}

.ss-reg-input-wrap {
    position: relative;
}

.ss-reg-input-wrap i {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: var(--reg-cream-2);
    pointer-events: none;
    transition: color 0.18s var(--ease);
}

.ss-reg-input {
    width: 100%;
    background: rgba(247, 242, 232, 0.04);
    border: 1px solid rgba(247, 242, 232, 0.10);
    border-radius: 8px;
    padding: 0.7rem 0.9rem 0.7rem 2.5rem;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    color: var(--reg-cream);
    outline: none;
    transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease), background 0.18s var(--ease);
}

.ss-reg-input::placeholder {
    color: rgba(247, 242, 232, 0.22);
}

.ss-reg-input:focus {
    border-color: rgba(212, 146, 42, 0.50);
    box-shadow: 0 0 0 3px rgba(212, 146, 42, 0.12);
    background: rgba(247, 242, 232, 0.06);
}

.ss-reg-input:focus + i,
.ss-reg-input-wrap:focus-within i {
    color: rgba(212, 146, 42, 0.60);
}

/* Erreur sur le champ */
.ss-reg-field.has-error .ss-reg-input {
    border-color: rgba(220, 80, 80, 0.55);
    background: var(--reg-error-bg);
}

.ss-reg-error-msg {
    font-size: 0.74rem;
    color: var(--reg-error);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.ss-reg-error-msg i {
    font-size: 0.68rem;
}

/* ─── Barre de force du mot de passe ─── */
.ss-strength-wrap {
    margin-top: 0.5rem;
}

.ss-strength-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    margin-bottom: 0.5rem;
}

.ss-strength-seg {
    height: 3px;
    border-radius: 2px;
    background: rgba(247, 242, 232, 0.10);
    transition: background 0.25s var(--ease);
}

.ss-strength-seg.active-1 { background: #dc5050; }
.ss-strength-seg.active-2 { background: #dc5050; }
.ss-strength-seg.active-3 { background: #e89a3c; }
.ss-strength-seg.active-4 { background: #52b788; }

/* ─── Critères du mot de passe ─── */
.ss-criteria-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.2rem 0.5rem;
    list-style: none;
    margin: 0;
    padding: 0;
}

.ss-criteria-item {
    font-size: 0.7rem;
    color: rgba(247, 242, 232, 0.36);
    display: flex;
    align-items: center;
    gap: 0.3rem;
    transition: color 0.2s var(--ease);
}

.ss-criteria-item i {
    font-size: 0.6rem;
    color: rgba(247, 242, 232, 0.24);
    transition: color 0.2s var(--ease);
}

.ss-criteria-item.valid {
    color: #52b788;
}

.ss-criteria-item.valid i {
    color: #52b788;
}

.ss-criteria-item.invalid i {
    color: #dc5050;
}

/* ─── Bouton Submit ─── */
.ss-reg-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.75rem;
    padding: 0.85rem 1.5rem;
    background: var(--reg-amber);
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

.ss-reg-btn:hover {
    background: var(--reg-amber-h);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212, 146, 42, 0.30);
}

.ss-reg-btn:active {
    transform: translateY(0);
    box-shadow: none;
}

/* ─── Lien login ─── */
.ss-reg-login-link {
    text-align: center;
    margin-top: 1.25rem;
    font-size: 0.8rem;
    color: rgba(247, 242, 232, 0.36);
}

.ss-reg-login-link a {
    color: var(--reg-amber);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.18s var(--ease);
}

.ss-reg-login-link a:hover {
    color: var(--reg-amber-h);
    text-decoration: underline;
}

/* ─── Séparateur entre le header et le form ─── */
.ss-reg-divider {
    width: 40px;
    height: 2px;
    background: linear-gradient(90deg, transparent, var(--reg-amber), transparent);
    margin: 0 auto 1.75rem;
    border: none;
}

/* ─── Responsive ─── */
@media (max-width: 480px) {
    .ss-reg-card {
        padding: 1.75rem 1.25rem;
    }

    .ss-reg-title {
        font-size: 1.75rem;
    }

    .ss-reg-row {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 360px) {
    .ss-reg-title {
        font-size: 1.5rem;
    }

    .ss-criteria-list {
        grid-template-columns: 1fr;
    }
}
```

**Step 3 : Vérifier que le fichier est sauvegardé**

Ouvrir `public/css/register.css` et vérifier que la première ligne est `/* ====...`.

**Step 4 : Commit**

```bash
git add public/css/register.css
git commit -m "style(register): réécriture CSS — esthétique Noir Académique, suppression Bulma"
```

---

## Task 2 : Réécrire `views/pages/register.ejs`

**Fichiers :**
- Modifier : `views/pages/register.ejs`

**Step 1 : Identifier les éléments à préserver**

- `<%- include('../partials/header.ejs') %>` et `</head>` en début de fichier (fournit le `<html>`, `<head>`, chargement CSS)
- `<body>` et `<%- include('../partials/navbar.ejs') %>`
- `<%- include('../partials/footer.ejs') %>` et `</body></html>` en fin
- `action="/register" method="POST"` sur le formulaire
- `name="lastname"`, `name="firstname"`, `name="email"`, `name="password"`, `name="confirmPassword"` sur les inputs
- `<%= formData.lastname || '' %>` etc. pour la persistance
- `<% if (errors && errors.lastname) { %>` etc. pour les erreurs
- `nonce="<%= cspNonce %>"` sur la balise `<script>`

**Step 2 : Écrire le nouveau template**

Remplacer tout le contenu de `views/pages/register.ejs` par :

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
    <%- include('../partials/navbar.ejs') %>

    <div class="ss-reg-page">
        <div class="ss-reg-card">

            <!-- En-tête -->
            <div class="ss-reg-header">
                <h1 class="ss-reg-title">Rejoignez <em>Skill</em><strong>Swap</strong></h1>
                <p class="ss-reg-subtitle">Créez votre compte gratuitement</p>
            </div>

            <hr class="ss-reg-divider">

            <!-- Formulaire -->
            <form action="/register" method="POST">

                <!-- Nom + Prénom côte à côte -->
                <div class="ss-reg-row">

                    <!-- Nom -->
                    <div class="ss-reg-field<% if (errors && errors.lastname) { %> has-error<% } %>">
                        <label class="ss-reg-label" for="lastname">Nom</label>
                        <div class="ss-reg-input-wrap">
                            <input
                                class="ss-reg-input"
                                type="text"
                                id="lastname"
                                name="lastname"
                                placeholder="Dupont"
                                value="<%= formData.lastname || '' %>"
                                autocomplete="family-name"
                            >
                            <i class="fas fa-user"></i>
                        </div>
                        <% if (errors && errors.lastname) { %>
                            <p class="ss-reg-error-msg">
                                <i class="fas fa-exclamation-circle"></i>
                                <%= errors.lastname %>
                            </p>
                        <% } %>
                    </div>

                    <!-- Prénom -->
                    <div class="ss-reg-field<% if (errors && errors.firstname) { %> has-error<% } %>">
                        <label class="ss-reg-label" for="firstname">Prénom</label>
                        <div class="ss-reg-input-wrap">
                            <input
                                class="ss-reg-input"
                                type="text"
                                id="firstname"
                                name="firstname"
                                placeholder="Jean"
                                value="<%= formData.firstname || '' %>"
                                autocomplete="given-name"
                            >
                            <i class="fas fa-user"></i>
                        </div>
                        <% if (errors && errors.firstname) { %>
                            <p class="ss-reg-error-msg">
                                <i class="fas fa-exclamation-circle"></i>
                                <%= errors.firstname %>
                            </p>
                        <% } %>
                    </div>

                </div><!-- /.ss-reg-row -->

                <!-- Email -->
                <div class="ss-reg-field<% if (errors && errors.email) { %> has-error<% } %>">
                    <label class="ss-reg-label" for="email">Email</label>
                    <div class="ss-reg-input-wrap">
                        <input
                            class="ss-reg-input"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="jean.dupont@exemple.com"
                            value="<%= formData.email || '' %>"
                            autocomplete="email"
                        >
                        <i class="fas fa-envelope"></i>
                    </div>
                    <% if (errors && errors.email) { %>
                        <p class="ss-reg-error-msg">
                            <i class="fas fa-exclamation-circle"></i>
                            <%= errors.email %>
                        </p>
                    <% } %>
                </div>

                <!-- Mot de passe -->
                <div class="ss-reg-field<% if (errors && errors.password) { %> has-error<% } %>">
                    <label class="ss-reg-label" for="password">Mot de passe</label>
                    <div class="ss-reg-input-wrap">
                        <input
                            class="ss-reg-input"
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Minimum 8 caractères"
                            autocomplete="new-password"
                        >
                        <i class="fas fa-lock"></i>
                    </div>
                    <% if (errors && errors.password) { %>
                        <p class="ss-reg-error-msg">
                            <i class="fas fa-exclamation-circle"></i>
                            <%= errors.password %>
                        </p>
                    <% } %>

                    <!-- Barre de force -->
                    <div class="ss-strength-wrap" id="strengthWrap" style="display:none;">
                        <div class="ss-strength-bar">
                            <div class="ss-strength-seg" id="seg1"></div>
                            <div class="ss-strength-seg" id="seg2"></div>
                            <div class="ss-strength-seg" id="seg3"></div>
                            <div class="ss-strength-seg" id="seg4"></div>
                        </div>
                        <ul class="ss-criteria-list">
                            <li class="ss-criteria-item" id="crit-len">
                                <i class="fas fa-times"></i>
                                8 caractères min.
                            </li>
                            <li class="ss-criteria-item" id="crit-upper">
                                <i class="fas fa-times"></i>
                                1 majuscule
                            </li>
                            <li class="ss-criteria-item" id="crit-num">
                                <i class="fas fa-times"></i>
                                1 chiffre
                            </li>
                            <li class="ss-criteria-item" id="crit-special">
                                <i class="fas fa-times"></i>
                                1 caractère spécial
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Confirmation mot de passe -->
                <div class="ss-reg-field<% if (errors && errors.confirmPassword) { %> has-error<% } %>">
                    <label class="ss-reg-label" for="confirmPassword">Confirmer le mot de passe</label>
                    <div class="ss-reg-input-wrap">
                        <input
                            class="ss-reg-input"
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="Retapez votre mot de passe"
                            autocomplete="new-password"
                        >
                        <i class="fas fa-lock"></i>
                    </div>
                    <% if (errors && errors.confirmPassword) { %>
                        <p class="ss-reg-error-msg">
                            <i class="fas fa-exclamation-circle"></i>
                            <%= errors.confirmPassword %>
                        </p>
                    <% } %>
                </div>

                <!-- Bouton -->
                <button type="submit" class="ss-reg-btn">
                    <i class="fas fa-user-plus"></i>
                    S'inscrire
                </button>

            </form>

            <!-- Lien login -->
            <p class="ss-reg-login-link">
                Déjà un compte ? <a href="/login">Se connecter</a>
            </p>

        </div><!-- /.ss-reg-card -->
    </div><!-- /.ss-reg-page -->

    <!-- JS : barre de force + critères (inline, noncé CSP) -->
    <script nonce="<%= cspNonce %>">
    (function () {
        const pwdInput    = document.getElementById('password');
        const strengthWrap = document.getElementById('strengthWrap');
        const segs        = [
            document.getElementById('seg1'),
            document.getElementById('seg2'),
            document.getElementById('seg3'),
            document.getElementById('seg4'),
        ];
        const crits = {
            len:     document.getElementById('crit-len'),
            upper:   document.getElementById('crit-upper'),
            num:     document.getElementById('crit-num'),
            special: document.getElementById('crit-special'),
        };

        function updateCrit(el, valid) {
            el.classList.toggle('valid', valid);
            el.classList.toggle('invalid', !valid);
            const icon = el.querySelector('i');
            icon.className = valid ? 'fas fa-check' : 'fas fa-times';
        }

        function updateStrength(val) {
            if (!val) {
                strengthWrap.style.display = 'none';
                segs.forEach(s => { s.className = 'ss-strength-seg'; });
                Object.values(crits).forEach(c => {
                    c.classList.remove('valid', 'invalid');
                    c.querySelector('i').className = 'fas fa-times';
                });
                return;
            }

            strengthWrap.style.display = 'block';

            const checks = {
                len:     val.length >= 8,
                upper:   /[A-Z]/.test(val),
                num:     /[0-9]/.test(val),
                special: /[^A-Za-z0-9]/.test(val),
            };

            Object.entries(checks).forEach(([key, ok]) => updateCrit(crits[key], ok));

            const score = Object.values(checks).filter(Boolean).length;

            segs.forEach((s, i) => {
                s.className = 'ss-strength-seg';
                if (i < score) s.classList.add('active-' + score);
            });
        }

        if (pwdInput) {
            pwdInput.addEventListener('input', () => updateStrength(pwdInput.value));
        }
    })();
    </script>

    <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 3 : Vérifier manuellement dans le navigateur**

Démarrer le serveur (`npm start` ou `node app.js`) et naviguer vers `http://localhost:<PORT>/register`.

Vérifications :
- [ ] Page s'affiche avec fond sombre et carte centrée
- [ ] Nom et Prénom sont côte à côte sur desktop
- [ ] Nom et Prénom s'empilent sur mobile (< 480px)
- [ ] Focus sur un champ → bordure amber + glow
- [ ] Taper dans le champ password → barre de force + critères apparaissent
- [ ] Score de force s'incrémente correctement (rouge → orange → vert)
- [ ] Soumettre le formulaire vide → erreurs serveur s'affichent en rouge sous chaque champ
- [ ] Soumettre avec données valides → redirect /onboarding

**Step 4 : Commit**

```bash
git add views/pages/register.ejs
git commit -m "feat(register): réécriture template — suppression Bulma, esthétique Noir Académique"
```

---

## Task 3 : Vérification finale et commit de clôture

**Step 1 : Vérifier que Bulma n'est plus utilisé dans ces fichiers**

```bash
grep -n "column\|is-centered\|has-icons-left\|control\b\|\.field\b" views/pages/register.ejs
```

Résultat attendu : aucune ligne (0 résultats).

**Step 2 : Vérifier la responsivité**

Dans le navigateur, réduire la fenêtre à 375px (iPhone) :
- [ ] Carte pleine largeur avec padding réduit
- [ ] Nom/Prénom empilés
- [ ] Bouton pleine largeur
- [ ] Pas de scroll horizontal

**Step 3 : Vérifier le contraste (accessibilité)**

Les labels amber sur fond sombre doivent être lisibles. Les messages d'erreur rouge doivent être visibles.

**Step 4 : Commit final**

```bash
git add -A
git commit -m "chore(register): vérification finale redesign — Noir Académique"
```

---

## Résumé des fichiers modifiés

| Fichier | Action |
|---------|--------|
| `public/css/register.css` | Réécriture complète |
| `views/pages/register.ejs` | Réécriture complète |
| `docs/plans/2026-02-25-register-design.md` | Créé (design doc) |
| `docs/plans/2026-02-25-register-implementation.md` | Créé (ce fichier) |
