# myProfil — Migration Noir Académique : Plan d'implémentation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réécrire la page Mon Profil (EJS + CSS + JS) pour adopter l'esthétique « Noir Académique » définie dans `style.md`, en supprimant toute dépendance à Bulma.

**Architecture:** Réécriture complète de `myProfil.css` avec les tokens Noir Académique (`--profil-*`), refonte de `myProfil.ejs` avec les classes `ss-profil-*` sans aucune classe Bulma, et mise à jour des 3 fichiers JS pour utiliser les nouvelles classes CSS custom. Pattern identique à `skills.css` / `talents.css` déjà migrés.

**Tech Stack:** EJS (templates), CSS pur (Flexbox, Custom Properties), JS vanilla (DOM classList), Node/Express

---

## Task 1 : Réécrire myProfil.css

**Files:**
- Modify: `public/css/myProfil.css`

**Step 1 : Remplacer le contenu de myProfil.css**

Remplacer intégralement le fichier par :

```css
/* ===== Page Mon Profil — Noir Académique ===== */
:root {
  --profil-bg:       #0C1E1C;
  --profil-card:     rgba(14, 34, 32, 0.72);
  --profil-border:   rgba(212, 146, 42, 0.18);
  --profil-border-h: rgba(212, 146, 42, 0.35);
  --profil-amber:    #D4922A;
  --profil-amber-h:  #E8A63C;
  --profil-cream:    #F7F2E8;
  --profil-muted:    rgba(247, 242, 232, 0.65);
  --profil-dim:      rgba(247, 242, 232, 0.40);
  --profil-error:    rgba(220, 80, 80, 0.55);
  --profil-error-bg: rgba(220, 80, 80, 0.08);
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--profil-bg);
}

footer { width: 100%; margin-top: auto; }

.ss-hidden { display: none !important; }

/* ── Header ── */
.ss-profil-header {
  background: rgba(14, 34, 32, 0.60);
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  padding: 4rem 1.5rem;
  text-align: center;
}

.ss-profil-header-icon {
  font-size: 3rem;
  color: var(--profil-amber);
  display: block;
  margin-bottom: 1rem;
}

.ss-profil-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--profil-amber);
  margin: 0 0 0.5rem;
}

.ss-profil-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: var(--profil-muted);
  margin: 0;
}

/* ── Main ── */
.ss-profil-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-profil-center {
  max-width: 720px;
  margin: 0 auto;
}

/* ── Cards (glass) ── */
.ss-profil-card,
.ss-profil-edit-card {
  background: var(--profil-card);
  border: 1px solid var(--profil-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 2rem;
  margin-bottom: 1.5rem;
}

/* ── Avatar section ── */
.ss-profil-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  margin-bottom: 1.5rem;
}

.ss-profil-avatar-wrap {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  border: 2px solid rgba(212, 146, 42, 0.30);
  overflow: hidden;
  margin-bottom: 1rem;
  background: rgba(212, 146, 42, 0.10);
  display: flex;
  align-items: center;
  justify-content: center;
}

.ss-profil-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ss-profil-avatar-default {
  font-size: 3rem;
  color: var(--profil-amber);
}

.ss-profil-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.25rem 0.85rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: var(--profil-amber);
  background: rgba(212, 146, 42, 0.08);
}

/* ── Info list ── */
.ss-profil-info-list {
  display: flex;
  flex-direction: column;
}

.ss-profil-info-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(212, 146, 42, 0.10);
}

.ss-profil-info-row:last-child { border-bottom: none; }

.ss-profil-info-icon {
  color: var(--profil-amber);
  font-size: 1rem;
  margin-top: 0.2rem;
  flex-shrink: 0;
  width: 1.25rem;
  text-align: center;
}

.ss-profil-info-body { flex: 1; }

.ss-profil-info-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--profil-dim);
  margin-bottom: 0.2rem;
}

.ss-profil-info-value {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: var(--profil-cream);
  word-break: break-word;
}

/* ── Skills block ── */
.ss-profil-skills-block { padding: 1rem 0; }

.ss-profil-skills-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--profil-dim);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ss-profil-skills-title i { color: var(--profil-amber); }

.ss-profil-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ss-profil-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: rgba(247, 242, 232, 0.75);
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  cursor: default;
}

.ss-profil-tag:hover {
  background: var(--profil-amber);
  color: #0C1E1C;
  border-color: var(--profil-amber);
}

/* ── Actions ── */
.ss-profil-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(212, 146, 42, 0.15);
  flex-wrap: wrap;
}

/* ── Buttons ── */
.ss-profil-btn-primary,
.ss-profil-btn-danger,
.ss-profil-btn-outline,
.ss-profil-btn-delete-confirm {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  border: 1px solid transparent;
}

.ss-profil-btn-primary {
  background: var(--profil-amber);
  color: #0C1E1C;
  border-color: var(--profil-amber);
}

.ss-profil-btn-primary:hover {
  background: var(--profil-amber-h);
  border-color: var(--profil-amber-h);
  transform: translateY(-1px);
}

.ss-profil-btn-danger {
  background: transparent;
  color: var(--profil-error);
  border-color: var(--profil-error);
}

.ss-profil-btn-danger:hover {
  background: var(--profil-error);
  color: var(--profil-cream);
  transform: translateY(-1px);
}

.ss-profil-btn-outline {
  background: transparent;
  color: var(--profil-amber);
  border-color: rgba(212, 146, 42, 0.40);
}

.ss-profil-btn-outline:hover {
  background: var(--profil-amber);
  color: #0C1E1C;
  transform: translateY(-1px);
}

.ss-profil-btn-delete-confirm {
  background: var(--profil-error);
  color: var(--profil-cream);
  border-color: var(--profil-error);
}

.ss-profil-btn-delete-confirm:hover {
  background: rgba(220, 80, 80, 0.80);
  transform: translateY(-1px);
}

/* ── Modal ── */
.ss-profil-modal {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.ss-profil-modal--active { display: flex; }

.ss-profil-modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.60);
  backdrop-filter: blur(4px);
}

.ss-profil-modal-box {
  position: relative;
  z-index: 1;
  background: var(--profil-card);
  border: 1px solid var(--profil-error);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 2.5rem 2rem;
  max-width: 520px;
  width: 100%;
  text-align: center;
}

.ss-profil-modal-warning-icon {
  font-size: 3rem;
  color: var(--profil-error);
  display: block;
  margin-bottom: 1rem;
}

.ss-profil-modal-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--profil-cream);
  margin: 0 0 0.5rem;
}

.ss-profil-modal-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--profil-muted);
  margin: 0 0 1.5rem;
}

.ss-profil-warning-box {
  background: var(--profil-error-bg);
  border: 1px solid var(--profil-error);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  color: rgba(220, 80, 80, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ss-profil-modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.ss-profil-delete-form { display: inline; }

.ss-profil-modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--profil-muted);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s ease;
}

.ss-profil-modal-close:hover { color: var(--profil-cream); }

/* ── Edit card ── */
.ss-profil-edit-header {
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  margin-bottom: 1.5rem;
}

.ss-profil-edit-header-icon {
  font-size: 2rem;
  color: var(--profil-amber);
  display: block;
  margin-bottom: 0.75rem;
}

.ss-profil-edit-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 600;
  font-style: italic;
  color: var(--profil-amber);
  margin: 0 0 0.25rem;
}

.ss-profil-edit-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  color: var(--profil-muted);
  margin: 0;
}

/* ── Form fields ── */
.ss-profil-field { margin-bottom: 1.5rem; }

.ss-profil-field-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--profil-cream);
  margin-bottom: 0.5rem;
}

.ss-profil-field-label i {
  color: var(--profil-amber);
  font-size: 0.85rem;
}

.ss-profil-input,
.ss-profil-textarea {
  width: 100%;
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 8px;
  color: var(--profil-cream);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  padding: 0.65rem 0.9rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
  outline: none;
}

.ss-profil-input:focus,
.ss-profil-textarea:focus {
  border-color: rgba(212, 146, 42, 0.55);
}

.ss-profil-input::placeholder,
.ss-profil-textarea::placeholder {
  color: var(--profil-dim);
  font-style: italic;
}

.ss-profil-textarea {
  resize: vertical;
  min-height: 120px;
}

.ss-profil-bio-help {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: var(--profil-dim);
  text-align: right;
  margin-top: 0.25rem;
}

/* ── Avatar edit ── */
.ss-profil-avatar-edit-wrap {
  text-align: center;
  margin-bottom: 1rem;
}

.ss-profil-avatar-edit-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(212, 146, 42, 0.30);
}

.ss-profil-avatar-edit-default {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.10);
  border: 2px solid rgba(212, 146, 42, 0.30);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2.2rem;
  color: var(--profil-amber);
}

/* ── File upload ── */
.ss-profil-upload-wrap {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(212, 146, 42, 0.20);
}

.ss-profil-upload-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 1rem;
  background: var(--profil-amber);
  color: #0C1E1C;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.ss-profil-upload-cta:hover { background: var(--profil-amber-h); }

.ss-profil-upload-cta input[type="file"] { display: none; }

.ss-profil-upload-filename {
  flex: 1;
  padding: 0.65rem 0.9rem;
  background: rgba(14, 34, 32, 0.50);
  color: var(--profil-muted);
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Info message ── */
.ss-profil-info-msg {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 146, 42, 0.06);
  border: 1px solid rgba(212, 146, 42, 0.18);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--profil-muted);
}

.ss-profil-info-msg i {
  color: var(--profil-amber);
  flex-shrink: 0;
}

/* ── Form actions ── */
.ss-profil-form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .ss-profil-center { max-width: 680px; }
}

@media (max-width: 600px) {
  .ss-profil-header { padding: 2.5rem 1rem; }
  .ss-profil-main { padding: 1.5rem 1rem 3rem; }
  .ss-profil-actions,
  .ss-profil-form-actions,
  .ss-profil-modal-actions { flex-direction: column; align-items: stretch; }
  .ss-profil-btn-primary,
  .ss-profil-btn-danger,
  .ss-profil-btn-outline,
  .ss-profil-btn-delete-confirm { justify-content: center; }
}

@media (max-width: 480px) {
  .ss-profil-title { font-size: clamp(1.6rem, 4vw, 2.2rem); }
}
```

**Step 2 : Vérifier la syntaxe CSS**

Run: `node -e "require('fs').readFileSync('public/css/myProfil.css', 'utf8'); console.log('OK')"`
Expected: `OK`

**Step 3 : Commit**

```bash
git add public/css/myProfil.css
git commit -m "style: réécriture CSS myProfil — Noir Académique"
```

---

## Task 2 : Réécrire myProfil.ejs

**Files:**
- Modify: `views/pages/myProfil.ejs`

**Step 1 : Remplacer le contenu de myProfil.ejs**

Remplacer intégralement le fichier par :

```ejs
<%- include('../partials/header') %>
<script src="/js/editProfil.js" defer></script>
<script src="/js/deleteProfil.js" defer></script>
<script src="/js/previsualition.js" defer></script>
</head>

<%- include('../partials/navbar.ejs') %>

<body>

  <header class="ss-profil-header">
    <i class="fa-solid fa-user-gear ss-profil-header-icon"></i>
    <h1 class="ss-profil-title">Mon Profil</h1>
    <p class="ss-profil-subtitle">Gérez vos informations personnelles</p>
  </header>

  <main class="ss-profil-main">
    <div class="ss-profil-center">

      <!-- Vue profil -->
      <div id="profil-view" class="ss-profil-card">

        <!-- Avatar -->
        <div class="ss-profil-avatar-section">
          <div class="ss-profil-avatar-wrap">
            <% if (user.image) { %>
              <img src="<%= user.image %>" alt="Avatar de <%= user.firstname %>" class="ss-profil-avatar-img">
            <% } else { %>
              <i class="fa-solid fa-user ss-profil-avatar-default"></i>
            <% } %>
          </div>
          <div class="ss-profil-badge">
            <i class="fa-solid fa-circle-check"></i>
            <span>Membre actif</span>
          </div>
        </div>

        <!-- Informations -->
        <div class="ss-profil-info-list">

          <div class="ss-profil-info-row">
            <i class="fa-solid fa-id-card ss-profil-info-icon"></i>
            <div class="ss-profil-info-body">
              <span class="ss-profil-info-label">Prénom</span>
              <span class="ss-profil-info-value"><%= user.firstname %></span>
            </div>
          </div>

          <div class="ss-profil-info-row">
            <i class="fa-solid fa-user ss-profil-info-icon"></i>
            <div class="ss-profil-info-body">
              <span class="ss-profil-info-label">Nom</span>
              <span class="ss-profil-info-value"><%= user.lastname %></span>
            </div>
          </div>

          <div class="ss-profil-info-row">
            <i class="fa-solid fa-envelope ss-profil-info-icon"></i>
            <div class="ss-profil-info-body">
              <span class="ss-profil-info-label">Email</span>
              <span class="ss-profil-info-value"><%= user.email %></span>
            </div>
          </div>

          <% if (user.bio) { %>
            <div class="ss-profil-info-row">
              <i class="fa-solid fa-pen-fancy ss-profil-info-icon"></i>
              <div class="ss-profil-info-body">
                <span class="ss-profil-info-label">À propos de moi</span>
                <span class="ss-profil-info-value"><%= user.bio %></span>
              </div>
            </div>
          <% } %>

        </div>

        <!-- Compétences -->
        <% if (user.skills && user.skills.length > 0) { %>
          <div class="ss-profil-skills-block">
            <p class="ss-profil-skills-title">
              <i class="fa-solid fa-certificate"></i>
              Mes compétences
            </p>
            <div class="ss-profil-tags">
              <% user.skills.forEach((skill, index) => { %>
                <span class="ss-profil-tag ss-profil-tag--<%= index % 4 %>">
                  <i class="fa-solid <%= skill.icon || 'fa-star' %>"></i>
                  <span><%= skill.label %></span>
                </span>
              <% }) %>
            </div>
          </div>
        <% } %>

        <!-- Actions -->
        <div class="ss-profil-actions">
          <button id="editBtn" class="ss-profil-btn-primary">
            <i class="fa-solid fa-pen-to-square"></i>
            <span>Modifier mon profil</span>
          </button>
          <button id="deleteBtn" class="ss-profil-btn-danger">
            <i class="fa-solid fa-trash-can"></i>
            <span>Supprimer mon compte</span>
          </button>
        </div>

      </div>

      <!-- Modal suppression -->
      <div id="delete-confirmation" class="ss-profil-modal">
        <div class="ss-profil-modal-backdrop"></div>
        <div class="ss-profil-modal-box">
          <i class="fa-solid fa-triangle-exclamation ss-profil-modal-warning-icon"></i>
          <h3 class="ss-profil-modal-title">Confirmer la suppression</h3>
          <p class="ss-profil-modal-subtitle">Êtes-vous vraiment sûr de vouloir supprimer votre profil ? Cette action est irréversible.</p>
          <div class="ss-profil-warning-box">
            <i class="fa-solid fa-exclamation-circle"></i>
            Toutes vos données seront définitivement perdues
          </div>
          <div class="ss-profil-modal-actions">
            <form action="/user/<%= user.id %>/profil?_method=DELETE" method="post" class="ss-profil-delete-form">
              <button type="submit" class="ss-profil-btn-delete-confirm">
                <i class="fa-solid fa-trash-can"></i>
                <span>Oui, supprimer définitivement</span>
              </button>
            </form>
            <button id="cancelDelete" class="ss-profil-btn-outline">
              <i class="fa-solid fa-xmark"></i>
              <span>Annuler</span>
            </button>
          </div>
        </div>
        <button class="ss-profil-modal-close" aria-label="Fermer" id="closeModal">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Formulaire d'édition -->
      <div id="profil-edit" class="ss-profil-edit-card ss-hidden">

        <div class="ss-profil-edit-header">
          <i class="fa-solid fa-user-pen ss-profil-edit-header-icon"></i>
          <h2 class="ss-profil-edit-title">Modifier mes informations</h2>
          <p class="ss-profil-edit-subtitle">Mettez à jour vos informations personnelles</p>
        </div>

        <form action="/user/<%= user.id %>/profil" method="POST" enctype="multipart/form-data">

          <!-- Photo -->
          <div class="ss-profil-field">
            <label class="ss-profil-field-label">
              <i class="fa-solid fa-camera"></i>
              Photo de profil
            </label>
            <div class="ss-profil-avatar-edit-wrap">
              <% if (user.image) { %>
                <img id="avatar-preview-edit" src="<%= user.image %>" alt="Avatar" class="ss-profil-avatar-edit-img">
              <% } else { %>
                <div id="avatar-preview-edit" class="ss-profil-avatar-edit-default">
                  <i class="fa-solid fa-user"></i>
                </div>
              <% } %>
            </div>
            <div class="ss-profil-upload-wrap">
              <label class="ss-profil-upload-cta">
                <i class="fa-solid fa-upload"></i>
                Changer la photo
                <input type="file" name="avatar" id="avatar-edit" accept="image/*">
              </label>
              <span class="ss-profil-upload-filename" id="file-name-edit">
                <%= user.image ? 'Photo actuelle' : 'Aucune photo' %>
              </span>
            </div>
          </div>

          <!-- Prénom -->
          <div class="ss-profil-field">
            <label class="ss-profil-field-label" for="firstname-edit">
              <i class="fa-solid fa-id-card"></i>
              Prénom
            </label>
            <input class="ss-profil-input" type="text" id="firstname-edit" name="firstname" value="<%= user.firstname %>" required>
          </div>

          <!-- Nom -->
          <div class="ss-profil-field">
            <label class="ss-profil-field-label" for="lastname-edit">
              <i class="fa-solid fa-user"></i>
              Nom
            </label>
            <input class="ss-profil-input" type="text" id="lastname-edit" name="lastname" value="<%= user.lastname %>" required>
          </div>

          <!-- Email -->
          <div class="ss-profil-field">
            <label class="ss-profil-field-label" for="email-edit">
              <i class="fa-solid fa-envelope"></i>
              Email
            </label>
            <input class="ss-profil-input" type="email" id="email-edit" name="email" value="<%= user.email %>" required>
          </div>

          <!-- Bio -->
          <div class="ss-profil-field">
            <label class="ss-profil-field-label" for="bio-edit">
              <i class="fa-solid fa-pen-fancy"></i>
              À propos de moi
            </label>
            <textarea class="ss-profil-textarea" name="bio" id="bio-edit" rows="4" maxlength="500" placeholder="Parlez-nous de vous..."><%= user.bio || '' %></textarea>
            <p class="ss-profil-bio-help">
              <span id="bio-count-edit"><%= user.bio ? user.bio.length : 0 %></span>/500 caractères
            </p>
          </div>

          <!-- Info message -->
          <div class="ss-profil-info-msg">
            <i class="fa-solid fa-info-circle"></i>
            Vos modifications seront prises en compte immédiatement
          </div>

          <!-- Boutons -->
          <div class="ss-profil-form-actions">
            <button type="submit" class="ss-profil-btn-primary">
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Enregistrer les modifications</span>
            </button>
            <button type="button" id="cancelEdit" class="ss-profil-btn-outline">
              <i class="fa-solid fa-xmark"></i>
              <span>Annuler</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  </main>

  <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Vérifier qu'aucune classe Bulma ne subsiste**

Run:
```bash
grep -E "class=\"[^\"]*\b(box|columns|column|section|container|is-|has-|button\b|field|control|input\b|label\b|tags\b|tag\b|modal\b|file\b)\b" views/pages/myProfil.ejs
```
Expected: aucun résultat (sortie vide)

**Step 3 : Commit**

```bash
git add views/pages/myProfil.ejs
git commit -m "feat: réécriture EJS myProfil — Noir Académique, suppression Bulma"
```

---

## Task 3 : Mettre à jour editProfil.js

**Files:**
- Modify: `public/js/editProfil.js`

**Step 1 : Remplacer le contenu**

```js
const view = document.querySelector("#profil-view");
const edit = document.querySelector("#profil-edit");
const editBtn = document.querySelector("#editBtn");
const cancelBtn = document.querySelector("#cancelEdit");

editBtn.addEventListener("click", () => {
  view.classList.add("ss-hidden");
  edit.classList.remove("ss-hidden");
});

cancelBtn.addEventListener("click", () => {
  edit.classList.add("ss-hidden");
  view.classList.remove("ss-hidden");
});
```

**Step 2 : Vérifier qu'is-hidden a disparu**

Run: `grep "is-hidden" public/js/editProfil.js`
Expected: aucun résultat

**Step 3 : Commit**

```bash
git add public/js/editProfil.js
git commit -m "fix: editProfil.js — is-hidden → ss-hidden"
```

---

## Task 4 : Mettre à jour deleteProfil.js

**Files:**
- Modify: `public/js/deleteProfil.js`

**Step 1 : Remplacer le contenu**

```js
const deleteBtn = document.getElementById('deleteBtn');
const deleteConfirmation = document.getElementById('delete-confirmation');
const cancelDelete = document.getElementById('cancelDelete');
const closeModal = document.getElementById('closeModal');

// Ouvrir la modale
deleteBtn.addEventListener('click', () => {
    deleteConfirmation.classList.add('ss-profil-modal--active');
});

// Fermer la modale - bouton annuler
cancelDelete.addEventListener('click', () => {
    deleteConfirmation.classList.remove('ss-profil-modal--active');
});

// Fermer la modale - croix
if (closeModal) {
    closeModal.addEventListener('click', () => {
        deleteConfirmation.classList.remove('ss-profil-modal--active');
    });
}

// Fermer la modale - clic sur le fond
const modalBackground = deleteConfirmation.querySelector('.ss-profil-modal-backdrop');
if (modalBackground) {
    modalBackground.addEventListener('click', () => {
        deleteConfirmation.classList.remove('ss-profil-modal--active');
    });
}
```

**Step 2 : Vérifier les anciennes classes**

Run: `grep -E "is-active|modal-background" public/js/deleteProfil.js`
Expected: aucun résultat

**Step 3 : Commit**

```bash
git add public/js/deleteProfil.js
git commit -m "fix: deleteProfil.js — is-active → ss-profil-modal--active, backdrop selector"
```

---

## Task 5 : Mettre à jour previsualition.js

**Files:**
- Modify: `public/js/previsualition.js`

**Step 1 : Remplacer le style inline de l'avatar preview**

À la ligne qui construit le style CSS inline de l'image avatar (dans le bloc `reader.onload`), remplacer :
```js
img.style.cssText = 'width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 3px solid #e8dce8;';
```
par :
```js
img.style.cssText = 'width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(212,146,42,0.30);';
```

**Step 2 : Vérifier**

Run: `grep "#e8dce8" public/js/previsualition.js`
Expected: aucun résultat

**Step 3 : Commit**

```bash
git add public/js/previsualition.js
git commit -m "fix: previsualition.js — couleur avatar preview Noir Académique"
```

---

## Task 6 : Mettre à jour style.md

**Files:**
- Modify: `style.md`

**Step 1 : Ajouter la ligne myProfil dans le tableau de nomenclature**

Dans la section `## Nomenclature des classes`, ajouter dans le tableau :

```markdown
| Mon Profil | `ss-profil-` |
```

après la ligne `| Skills     | `ss-sk-`     |`

**Step 2 : Commit**

```bash
git add style.md
git commit -m "docs: style.md — ajouter préfixe ss-profil- dans la nomenclature"
```

---

## Vérification finale

**Step 1 : Démarrer le serveur**

Run: `npm run dev`

**Step 2 : Checklist visuelle dans le navigateur (route `/user/:id/profil`)**

- [ ] Fond de page `#0C1E1C` (vert sombre)
- [ ] Header glass avec titre Cormorant Garamond italic amber
- [ ] Card profil glass (backdrop-filter, border amber)
- [ ] Avatar circulaire avec border amber
- [ ] Badge « Membre actif » pill amber
- [ ] Info rows séparées par fine ligne amber, icônes amber, valeurs crème
- [ ] Tags compétences pill amber, hover fond amber
- [ ] Bouton « Modifier » amber plein, bouton « Supprimer » outline rouge
- [ ] Clic « Modifier » → formulaire visible, vue cachée (ss-hidden)
- [ ] Clic « Annuler » → retour à la vue
- [ ] Clic « Supprimer » → modal ouverte (ss-profil-modal--active, overlay sombre)
- [ ] Clic backdrop / croix / Annuler → modal fermée
- [ ] Upload photo → preview avatar mise à jour avec border amber
- [ ] Compteur bio fonctionnel
- [ ] Responsive 600px : boutons en colonne
