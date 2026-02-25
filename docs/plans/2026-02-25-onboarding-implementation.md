# Onboarding Page Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réécrire `views/pages/onboarding.ejs` et `public/css/onboarding.css` pour supprimer Bulma CSS et aligner sur l'esthétique "Noir Académique", et supprimer `public/js/onboarding.js` en déplaçant la logique JS inline (noncée CSP).

**Architecture:** Carte verre centrée (même approche que register), page unique défilable, 4 sections séparées par des `<hr>` amber, pills compétences cliquables, JS inline noncé CSP pour avatar preview / bio counter / skills filter + counter.

**Tech Stack:** EJS, CSS pur (Grid, Flexbox, CSS Custom Properties), JS vanilla inline (nonce CSP), Font Awesome icons

---

## Contexte important

- La route GET `/onboarding` passe `{ user, skills, title, cssFile: 'onboarding' }` à la vue
- `user.firstname` est disponible pour la salutation personnalisée
- `skills` est un array d'objets `{ id, label, slug, icon }` (icon = classe FA ex: `fa-lightbulb`)
- Le formulaire **doit** avoir `enctype="multipart/form-data"` pour l'upload avatar (Multer)
- Noms de champs à préserver : `avatar` (file), `bio` (textarea), `skills[]` (checkboxes), `new_skill` (text)
- Le JS doit avoir `nonce="<%= cspNonce %>"` sinon le CSP bloquera le script
- Le fichier `public/js/onboarding.js` sera **supprimé** — logique déplacée inline
- La balise `<script src="/js/onboarding.js" defer></script>` dans le template sera supprimée
- Google Fonts doit être importé dans le CSS (`@import url(...)`)

---

## Task 1 : Réécrire `public/css/onboarding.css`

**Fichiers :**
- Modifier : `public/css/onboarding.css`

**Step 1 : Remplacer tout le contenu de `public/css/onboarding.css`**

```css
/* ====================================================
   SKILLSWAP — ONBOARDING PAGE (Pure CSS, no framework)
   CSS Custom Properties · Flexbox · Grid
==================================================== */

@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Outfit:wght@300;400;500;600&display=swap');

:root {
    --ob-bg:        #0C1E1C;
    --ob-card-bg:   rgba(14, 34, 32, 0.72);
    --ob-border:    rgba(212, 146, 42, 0.18);
    --ob-amber:     #D4922A;
    --ob-amber-h:   #E8A63C;
    --ob-cream:     #F7F2E8;
    --ob-cream-4:   rgba(247, 242, 232, 0.42);
    --ob-cream-2:   rgba(247, 242, 232, 0.18);
    --ob-cream-1:   rgba(247, 242, 232, 0.10);
    --ob-error:     rgba(220, 80, 80, 0.85);
    --font-serif:   'Cormorant Garamond', Georgia, serif;
    --font-sans:    'Outfit', system-ui, sans-serif;
    --ease:         cubic-bezier(0.4, 0, 0.2, 1);
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
    background-color: var(--ob-bg);
    font-family: var(--font-sans);
    color: var(--ob-cream);
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
.ss-ob-page {
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 120px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 3rem 1rem;
}

/* ─── Carte verre ─── */
.ss-ob-card {
    width: min(620px, 100%);
    background: var(--ob-card-bg);
    backdrop-filter: blur(16px) saturate(1.4);
    -webkit-backdrop-filter: blur(16px) saturate(1.4);
    border: 1px solid var(--ob-border);
    border-radius: 16px;
    padding: 2.5rem;
    box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.45),
        inset 0 1px 0 rgba(212, 146, 42, 0.10);
}

/* ─── En-tête ─── */
.ss-ob-header {
    text-align: center;
    margin-bottom: 2rem;
}

.ss-ob-title {
    font-family: var(--font-serif);
    font-size: 2rem;
    font-weight: 600;
    font-style: italic;
    line-height: 1.15;
    color: var(--ob-cream);
    margin: 0 0 0.5rem;
}

.ss-ob-title em {
    font-style: italic;
    color: var(--ob-amber);
}

.ss-ob-subtitle {
    font-size: 0.82rem;
    color: var(--ob-cream-4);
    margin: 0;
    letter-spacing: 0.03em;
}

/* ─── Séparateur ─── */
.ss-ob-sep {
    width: 100%;
    border: none;
    border-top: 1px solid;
    border-image: linear-gradient(90deg, transparent, rgba(212, 146, 42, 0.22), transparent) 1;
    margin: 1.75rem 0;
}

/* ─── Titre de section ─── */
.ss-ob-section {
    margin-bottom: 0;
}

.ss-ob-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
}

.ss-ob-section-title {
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ob-amber);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.ss-ob-section-title i {
    font-size: 0.7rem;
    opacity: 0.75;
}

.ss-ob-badge {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    padding: 0.2rem 0.55rem;
    border-radius: 100px;
    border: 1px solid;
}

.ss-ob-badge--optional {
    color: var(--ob-cream-4);
    border-color: rgba(247, 242, 232, 0.12);
}

.ss-ob-badge--required {
    color: var(--ob-amber);
    border-color: rgba(212, 146, 42, 0.35);
}

/* ─── Avatar ─── */
.ss-ob-avatar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
}

.ss-ob-avatar-zone {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 2px dashed rgba(212, 146, 42, 0.35);
    background: rgba(212, 146, 42, 0.06);
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.18s var(--ease), background 0.18s var(--ease);
    position: relative;
}

.ss-ob-avatar-zone:hover {
    border-color: rgba(212, 146, 42, 0.60);
    background: rgba(212, 146, 42, 0.10);
}

.ss-ob-avatar-icon {
    font-size: 1.75rem;
    color: rgba(247, 242, 232, 0.28);
    transition: opacity 0.15s;
}

.ss-ob-avatar-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: none;
}

.ss-ob-avatar-hint {
    font-size: 0.72rem;
    color: var(--ob-cream-4);
    text-align: center;
}

.ss-ob-avatar-filename {
    font-size: 0.7rem;
    color: var(--ob-amber);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ─── Bio ─── */
.ss-ob-textarea-wrap {
    position: relative;
}

.ss-ob-textarea {
    width: 100%;
    background: rgba(247, 242, 232, 0.04);
    border: 1px solid rgba(247, 242, 232, 0.10);
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    color: var(--ob-cream);
    outline: none;
    resize: none;
    min-height: 90px;
    transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.ss-ob-textarea::placeholder {
    color: rgba(247, 242, 232, 0.22);
}

.ss-ob-textarea:focus {
    border-color: rgba(212, 146, 42, 0.50);
    box-shadow: 0 0 0 3px rgba(212, 146, 42, 0.12);
}

.ss-ob-bio-count {
    position: absolute;
    bottom: 0.5rem;
    right: 0.75rem;
    font-size: 0.65rem;
    color: rgba(212, 146, 42, 0.55);
    pointer-events: none;
}

/* ─── Recherche skills ─── */
.ss-ob-search-wrap {
    position: relative;
    margin-bottom: 1rem;
}

.ss-ob-search-wrap i {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.75rem;
    color: var(--ob-cream-2);
    pointer-events: none;
}

.ss-ob-search {
    width: 100%;
    background: rgba(247, 242, 232, 0.04);
    border: 1px solid rgba(247, 242, 232, 0.10);
    border-radius: 8px;
    padding: 0.6rem 0.9rem 0.6rem 2.4rem;
    font-family: var(--font-sans);
    font-size: 0.85rem;
    color: var(--ob-cream);
    outline: none;
    transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.ss-ob-search::placeholder {
    color: rgba(247, 242, 232, 0.22);
}

.ss-ob-search:focus {
    border-color: rgba(212, 146, 42, 0.50);
    box-shadow: 0 0 0 3px rgba(212, 146, 42, 0.12);
}

/* ─── Grille de pills ─── */
.ss-ob-skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    max-height: 220px;
    overflow-y: auto;
    padding: 0.25rem 0.1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(212, 146, 42, 0.25) transparent;
}

.ss-ob-skills-grid::-webkit-scrollbar {
    width: 4px;
}

.ss-ob-skills-grid::-webkit-scrollbar-track {
    background: transparent;
}

.ss-ob-skills-grid::-webkit-scrollbar-thumb {
    background: rgba(212, 146, 42, 0.25);
    border-radius: 2px;
}

/* ─── Pill ─── */
.ss-ob-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.32rem 0.85rem;
    border-radius: 100px;
    border: 1px solid rgba(247, 242, 232, 0.10);
    background: rgba(247, 242, 232, 0.05);
    font-size: 0.78rem;
    color: rgba(247, 242, 232, 0.55);
    cursor: pointer;
    user-select: none;
    transition: border-color 0.15s var(--ease), background 0.15s var(--ease), color 0.15s var(--ease);
}

.ss-ob-pill:hover {
    border-color: rgba(212, 146, 42, 0.30);
    color: rgba(247, 242, 232, 0.80);
}

/* input checkbox hidden */
.ss-ob-pill input[type="checkbox"] {
    display: none;
}

/* État coché via :has() */
.ss-ob-pill:has(input:checked) {
    border-color: var(--ob-amber);
    background: rgba(212, 146, 42, 0.15);
    color: var(--ob-cream);
}

.ss-ob-pill-check {
    font-size: 0.6rem;
    color: var(--ob-amber);
    display: none;
}

.ss-ob-pill:has(input:checked) .ss-ob-pill-check {
    display: inline;
}

/* ─── Compteur sélection ─── */
.ss-ob-skill-count {
    font-size: 0.75rem;
    color: var(--ob-amber);
    margin-top: 0.65rem;
    display: none;
}

/* ─── Input nouvelle compétence ─── */
.ss-ob-input-wrap {
    position: relative;
}

.ss-ob-input-wrap i {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: var(--ob-cream-2);
    pointer-events: none;
    transition: color 0.18s var(--ease);
}

.ss-ob-input {
    width: 100%;
    background: rgba(247, 242, 232, 0.04);
    border: 1px solid rgba(247, 242, 232, 0.10);
    border-radius: 8px;
    padding: 0.7rem 0.9rem 0.7rem 2.5rem;
    font-family: var(--font-sans);
    font-size: 0.88rem;
    color: var(--ob-cream);
    outline: none;
    transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease);
}

.ss-ob-input::placeholder {
    color: rgba(247, 242, 232, 0.22);
}

.ss-ob-input:focus {
    border-color: rgba(212, 146, 42, 0.50);
    box-shadow: 0 0 0 3px rgba(212, 146, 42, 0.12);
}

.ss-ob-input-wrap:focus-within i {
    color: rgba(212, 146, 42, 0.60);
}

.ss-ob-input-hint {
    font-size: 0.7rem;
    color: rgba(247, 242, 232, 0.28);
    margin-top: 0.35rem;
}

/* ─── Actions ─── */
.ss-ob-actions {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
}

.ss-ob-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.85rem 1.5rem;
    background: var(--ob-amber);
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

.ss-ob-btn:hover:not(:disabled) {
    background: var(--ob-amber-h);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(212, 146, 42, 0.30);
}

.ss-ob-btn:active {
    transform: translateY(0);
    box-shadow: none;
}

.ss-ob-btn:disabled {
    opacity: 0.40;
    cursor: not-allowed;
}

.ss-ob-skip {
    font-size: 0.78rem;
    color: rgba(247, 242, 232, 0.32);
    text-decoration: none;
    transition: color 0.18s var(--ease);
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.ss-ob-skip:hover {
    color: rgba(247, 242, 232, 0.65);
}

.ss-ob-skip i {
    font-size: 0.65rem;
}

/* ─── Responsive ─── */
@media (max-width: 640px) {
    .ss-ob-card {
        padding: 1.75rem 1.25rem;
    }

    .ss-ob-title {
        font-size: 1.7rem;
    }
}

@media (max-width: 480px) {
    .ss-ob-avatar-zone {
        width: 80px;
        height: 80px;
    }

    .ss-ob-avatar-icon {
        font-size: 1.4rem;
    }

    .ss-ob-title {
        font-size: 1.5rem;
    }
}

@media (max-width: 360px) {
    .ss-ob-pill {
        font-size: 0.72rem;
        padding: 0.28rem 0.65rem;
    }
}
```

**Step 2 : Vérifier que le fichier commence bien par le commentaire de titre**

Ouvrir `public/css/onboarding.css` et confirmer que la ligne 1 est `/* ====...`.

**Step 3 : Commit**

```bash
git add public/css/onboarding.css
git commit -m "style(onboarding): réécriture CSS — esthétique Noir Académique, suppression Bulma"
```

---

## Task 2 : Réécrire `views/pages/onboarding.ejs`

**Fichiers :**
- Modifier : `views/pages/onboarding.ejs`

**Step 1 : Identifier les éléments à préserver**

- `<%- include('../partials/header.ejs') %>` et `</head>` (ne pas inclure le script onboarding.js ici)
- `<body>`, navbar et footer partials
- `action="/onboarding" method="POST" enctype="multipart/form-data"` (**enctype obligatoire pour Multer**)
- `name="avatar"` (file), `name="bio"` (textarea), `name="skills[]"` (checkboxes), `name="new_skill"` (text)
- `<%= user.firstname %>` pour la salutation
- Loop EJS : `<% skills.forEach((skill, index) => { %>`
- `skill.id`, `skill.label` dans la loop
- `nonce="<%= cspNonce %>"` sur la balise `<script>`

**Step 2 : Écrire le nouveau template**

Remplacer tout le contenu de `views/pages/onboarding.ejs` par :

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
    <%- include('../partials/navbar.ejs') %>

    <div class="ss-ob-page">
        <div class="ss-ob-card">

            <!-- En-tête -->
            <div class="ss-ob-header">
                <h1 class="ss-ob-title">Bienvenue, <em><%= user.firstname %></em> !</h1>
                <p class="ss-ob-subtitle">Complétez votre profil pour commencer à échanger vos compétences</p>
            </div>

            <form id="ob-form" action="/onboarding" method="POST" enctype="multipart/form-data">

                <!-- Section 1 : Avatar -->
                <div class="ss-ob-section">
                    <div class="ss-ob-section-header">
                        <h2 class="ss-ob-section-title">
                            <i class="fas fa-camera"></i>
                            Photo de profil
                        </h2>
                        <span class="ss-ob-badge ss-ob-badge--optional">Optionnel</span>
                    </div>
                    <div class="ss-ob-avatar-wrap">
                        <label class="ss-ob-avatar-zone" for="avatar" aria-label="Choisir une photo de profil">
                            <i class="fas fa-camera ss-ob-avatar-icon" id="avatarIcon"></i>
                            <img class="ss-ob-avatar-img" id="avatarPreview" src="" alt="Aperçu avatar">
                            <input type="file" name="avatar" id="avatar" accept="image/*" style="display:none;">
                        </label>
                        <p class="ss-ob-avatar-hint">JPG, PNG, GIF · max 5 Mo</p>
                        <span class="ss-ob-avatar-filename" id="avatarFilename" style="display:none;"></span>
                    </div>
                </div>

                <hr class="ss-ob-sep">

                <!-- Section 2 : Bio -->
                <div class="ss-ob-section">
                    <div class="ss-ob-section-header">
                        <h2 class="ss-ob-section-title">
                            <i class="fas fa-pen-fancy"></i>
                            À propos de vous
                        </h2>
                        <span class="ss-ob-badge ss-ob-badge--optional">Optionnel</span>
                    </div>
                    <div class="ss-ob-textarea-wrap">
                        <textarea
                            class="ss-ob-textarea"
                            name="bio"
                            id="bio"
                            maxlength="500"
                            placeholder="Ex : Passionné de développement web, j'aime partager mes connaissances..."
                        ></textarea>
                        <span class="ss-ob-bio-count" id="bioCount">0/500</span>
                    </div>
                </div>

                <hr class="ss-ob-sep">

                <!-- Section 3 : Compétences -->
                <div class="ss-ob-section">
                    <div class="ss-ob-section-header">
                        <h2 class="ss-ob-section-title">
                            <i class="fas fa-star"></i>
                            Vos compétences
                        </h2>
                        <span class="ss-ob-badge ss-ob-badge--required">Requis</span>
                    </div>

                    <div class="ss-ob-search-wrap">
                        <i class="fas fa-search"></i>
                        <input
                            class="ss-ob-search"
                            type="text"
                            id="skillSearch"
                            placeholder="Rechercher une compétence..."
                            autocomplete="off"
                        >
                    </div>

                    <div class="ss-ob-skills-grid" id="skillsGrid">
                        <% if (skills && skills.length > 0) { %>
                            <% skills.forEach(skill => { %>
                                <label class="ss-ob-pill" data-name="<%= skill.label.toLowerCase() %>">
                                    <input type="checkbox" name="skills[]" value="<%= skill.id %>">
                                    <%= skill.label %>
                                    <i class="fas fa-check ss-ob-pill-check"></i>
                                </label>
                            <% }) %>
                        <% } else { %>
                            <p style="color: rgba(247,242,232,0.38); font-size: 0.82rem;">Aucune compétence disponible.</p>
                        <% } %>
                    </div>

                    <p class="ss-ob-skill-count" id="skillCount"></p>
                </div>

                <hr class="ss-ob-sep">

                <!-- Section 4 : Nouvelle compétence -->
                <div class="ss-ob-section">
                    <div class="ss-ob-section-header">
                        <h2 class="ss-ob-section-title">
                            <i class="fas fa-plus-circle"></i>
                            Proposer une compétence
                        </h2>
                        <span class="ss-ob-badge ss-ob-badge--optional">Optionnel</span>
                    </div>
                    <div class="ss-ob-input-wrap">
                        <input
                            class="ss-ob-input"
                            type="text"
                            name="new_skill"
                            id="newSkill"
                            placeholder="Ex : Photographie culinaire, Arduino, Origami..."
                            maxlength="50"
                        >
                        <i class="fas fa-lightbulb"></i>
                    </div>
                    <p class="ss-ob-input-hint">Cette compétence sera soumise pour validation avant d'être ajoutée au catalogue.</p>
                </div>

                <!-- Actions -->
                <div class="ss-ob-actions">
                    <button type="submit" id="obSubmit" class="ss-ob-btn" disabled>
                        <i class="fas fa-check-circle"></i>
                        Terminer et explorer SkillSwap
                    </button>
                    <a href="/skills" class="ss-ob-skip">
                        <i class="fas fa-clock"></i>
                        Plus tard
                    </a>
                </div>

            </form>

        </div><!-- /.ss-ob-card -->
    </div><!-- /.ss-ob-page -->

    <!-- JS inline : avatar preview + bio counter + skills filter + submit guard -->
    <script nonce="<%= cspNonce %>">
    (function () {

        /* ── Avatar ── */
        const avatarInput    = document.getElementById('avatar');
        const avatarPreview  = document.getElementById('avatarPreview');
        const avatarIcon     = document.getElementById('avatarIcon');
        const avatarFilename = document.getElementById('avatarFilename');

        if (avatarInput) {
            avatarInput.addEventListener('change', function () {
                const file = this.files[0];
                if (!file) return;

                avatarFilename.textContent = file.name;
                avatarFilename.style.display = 'block';

                const reader = new FileReader();
                reader.onload = function (e) {
                    avatarPreview.src = e.target.result;
                    avatarPreview.style.display = 'block';
                    avatarIcon.style.display = 'none';
                };
                reader.readAsDataURL(file);
            });
        }

        /* ── Bio counter ── */
        const bioTextarea = document.getElementById('bio');
        const bioCount    = document.getElementById('bioCount');

        if (bioTextarea && bioCount) {
            bioTextarea.addEventListener('input', function () {
                bioCount.textContent = this.value.length + '/500';
            });
        }

        /* ── Skills : filter + counter + submit guard ── */
        const skillSearch = document.getElementById('skillSearch');
        const submitBtn   = document.getElementById('obSubmit');
        const skillCount  = document.getElementById('skillCount');
        const pills       = document.querySelectorAll('.ss-ob-pill');

        function updateSkillCount() {
            const checked = document.querySelectorAll('.ss-ob-pill input:checked').length;
            if (checked > 0) {
                skillCount.textContent = checked + ' compétence' + (checked > 1 ? 's' : '') + ' sélectionnée' + (checked > 1 ? 's' : '');
                skillCount.style.display = 'block';
                submitBtn.disabled = false;
            } else {
                skillCount.style.display = 'none';
                submitBtn.disabled = true;
            }
        }

        pills.forEach(function (pill) {
            pill.addEventListener('change', updateSkillCount);
        });

        if (skillSearch) {
            skillSearch.addEventListener('input', function () {
                const term = this.value.toLowerCase();
                pills.forEach(function (pill) {
                    const name = pill.getAttribute('data-name') || '';
                    pill.style.display = name.includes(term) ? '' : 'none';
                });
            });
        }

        /* ── Submit guard ── */
        const form = document.getElementById('ob-form');
        if (form) {
            form.addEventListener('submit', function (e) {
                const checked = document.querySelectorAll('.ss-ob-pill input:checked').length;
                if (checked === 0) {
                    e.preventDefault();
                    skillCount.textContent = 'Veuillez sélectionner au moins une compétence.';
                    skillCount.style.display = 'block';
                    skillCount.style.color = 'rgba(220, 80, 80, 0.85)';
                }
            });
        }

    })();
    </script>

    <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 3 : Vérifier dans le navigateur**

Démarrer le serveur et aller sur `http://localhost:<PORT>/onboarding` (connecté).

Vérifications :
- [ ] Page s'affiche avec fond sombre et carte centrée
- [ ] Salutation avec le prénom de l'utilisateur connecté
- [ ] Click sur la zone avatar → ouvre le file picker
- [ ] Sélection d'une image → preview circulaire + nom affiché
- [ ] Compteur bio s'incrémente en tapant
- [ ] Grille de pills visible avec scroll si beaucoup de compétences
- [ ] Click sur une pill → fond amber, icône check apparaît
- [ ] Compteur sous la grille s'affiche dès 1 sélection
- [ ] Bouton submit disabled → se débloque dès 1 skill sélectionné
- [ ] Filtre recherche cache les pills non-matchées
- [ ] Submit avec 0 skills → message d'erreur rouge + pas de submit
- [ ] Submit valide → redirect vers `/` (homepage)
- [ ] Responsive : carte pleine largeur sur mobile

**Step 4 : Commit**

```bash
git add views/pages/onboarding.ejs
git commit -m "feat(onboarding): réécriture template — suppression Bulma, esthétique Noir Académique"
```

---

## Task 3 : Supprimer `public/js/onboarding.js`

**Fichiers :**
- Supprimer : `public/js/onboarding.js`

**Step 1 : Vérifier qu'aucun autre fichier ne charge onboarding.js**

```bash
grep -r "onboarding.js" views/ public/
```

Résultat attendu : 0 résultats (la balise `<script src="/js/onboarding.js">` a déjà été supprimée du template à la Task 2).

**Step 2 : Supprimer le fichier**

```bash
rm public/js/onboarding.js
```

**Step 3 : Vérifier que la page fonctionne toujours**

Recharger `http://localhost:<PORT>/onboarding` et vérifier qu'il n'y a pas d'erreur 404 dans la console réseau.

**Step 4 : Commit**

```bash
git add -A
git commit -m "chore(onboarding): supprimer onboarding.js — logique déplacée inline"
```

---

## Task 4 : Vérification finale

**Step 1 : Vérifier l'absence de classes Bulma**

```bash
grep -n "columns\|is-centered\|is-hidden\|has-icons-left\|is-large\|box\b\|field\b\|control\b\|button\b" views/pages/onboarding.ejs
```

Résultat attendu : 0 résultats.

**Step 2 : Vérifier le responsive (375px)**

Ouvrir les DevTools, passer en vue mobile 375px :
- [ ] Carte pleine largeur
- [ ] Avatar zone 80px
- [ ] Pills lisibles
- [ ] Pas de scroll horizontal

**Step 3 : Vérifier la soumission complète**

Remplir tous les champs, sélectionner 2-3 compétences, soumettre.
- [ ] Redirect vers `/`
- [ ] Bio sauvegardée en base
- [ ] Skills associées en base (`user_has_skill`)

**Step 4 : Commit final**

```bash
git add -A
git commit -m "chore(onboarding): vérification finale redesign — Noir Académique"
```

---

## Résumé des fichiers modifiés

| Fichier | Action |
|---------|--------|
| `public/css/onboarding.css` | Réécriture complète |
| `views/pages/onboarding.ejs` | Réécriture complète |
| `public/js/onboarding.js` | **Supprimé** |
| `docs/plans/2026-02-25-onboarding-design.md` | Créé (design doc) |
| `docs/plans/2026-02-25-onboarding-implementation.md` | Créé (ce fichier) |
