# Migration Noir Académique — talent / skill / notifications / messages

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrer 4 pages EJS + leurs CSS vers l'esthétique « Noir Académique » définie dans `style.md`, en supprimant toutes les dépendances Bulma et en adoptant la nomenclature `ss-`.

**Architecture:** Réécriture complète de chaque paire EJS/CSS (suppression Bulma, nouvelles classes préfixées `ss-`). `messages.css` est partagé avec `conversation.ejs` — seule la section `msg-` est réécrite, la section `conv-` est conservée. `review.js` reçoit une mise à jour mineure des sélecteurs CSS et des couleurs amber.

**Tech Stack:** EJS, CSS pur (Grid, Flexbox, Custom Properties), Vanilla JS inline (`nonce`), Font Awesome (déjà chargé via le partial header — supprimer les CDN redondants dans talent.ejs et messages.ejs)

---

## Task 1 : Mettre à jour `style.md`

**Fichiers :**
- Modify: `style.md`

**Step 1 : Ajouter 4 lignes dans la table des nomenclatures**

Trouver la ligne `| Aide       | \`ss-help-\`   |` et ajouter après :

```markdown
| Talent (profil)     | `ss-tp-`     |
| Compétence (détail) | `ss-sp-`     |
| Notifications       | `ss-notif-`  |
| Messages            | `ss-msg-`    |
```

**Step 2 : Vérifier**

Le tableau doit maintenant contenir 13 lignes de pages.

**Step 3 : Commit**

```bash
git add style.md
git commit -m "docs: style.md — ajouter préfixes ss-tp-, ss-sp-, ss-notif-, ss-msg-"
```

---

## Task 2 : Réécrire `public/css/talent.css`

**Fichiers :**
- Modify (réécriture complète): `public/css/talent.css`

**Step 1 : Remplacer tout le contenu**

```css
/* ===== Page Talent Profil — Noir Académique ===== */
:root {
  --tp-bg:       #0C1E1C;
  --tp-card:     rgba(14, 34, 32, 0.72);
  --tp-border:   rgba(212, 146, 42, 0.18);
  --tp-border-h: rgba(212, 146, 42, 0.35);
  --tp-amber:    #D4922A;
  --tp-amber-h:  #E8A63C;
  --tp-cream:    #F7F2E8;
  --tp-muted:    rgba(247, 242, 232, 0.65);
  --tp-dim:      rgba(247, 242, 232, 0.40);
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--tp-bg);
}

footer { width: 100%; margin-top: auto; }

/* ── Main ── */
.ss-tp-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-tp-container {
  max-width: 1100px;
  margin: 0 auto;
}

/* ── Layout 2 colonnes ── */
.ss-tp-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Carte glass (patron commun) ── */
.ss-tp-card {
  background: var(--tp-card);
  border: 1px solid var(--tp-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

/* ── Header profil ── */
.ss-tp-header {
  text-align: center;
  padding: 2rem 1.5rem;
}

.ss-tp-verified {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: var(--tp-amber);
  color: #0C1E1C;
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  margin-bottom: 1.25rem;
}

.ss-tp-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.20);
  border: 2px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-family: 'Outfit', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--tp-cream);
  overflow: hidden;
}

.ss-tp-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ss-tp-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.5rem, 4vw, 2rem);
  font-weight: 600;
  color: var(--tp-cream);
  margin: 0 0 0.75rem;
}

.ss-tp-stars-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  margin-bottom: 0.3rem;
}

.ss-tp-stars-row i { color: rgba(247, 242, 232, 0.20); }
.ss-tp-stars-row i.filled { color: var(--tp-amber); }

.ss-tp-rating {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: var(--tp-muted);
  display: block;
  margin-bottom: 1.25rem;
}

/* ── Boutons d'action ── */
.ss-tp-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.ss-tp-btn-follow,
.ss-tp-btn-message {
  flex: 1;
  max-width: 180px;
  padding: 0.7rem 1rem;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
}

.ss-tp-btn-follow {
  background: transparent;
  border: 1px solid var(--tp-amber);
  color: var(--tp-amber);
}

.ss-tp-btn-follow:hover,
.ss-tp-btn-follow.is-following {
  background: var(--tp-amber);
  color: #0C1E1C;
}

.ss-tp-btn-message {
  background: var(--tp-amber);
  border: 1px solid var(--tp-amber);
  color: #0C1E1C;
}

.ss-tp-btn-message:hover {
  background: var(--tp-amber-h);
  border-color: var(--tp-amber-h);
  transform: translateY(-1px);
}

/* ── Titre de section ── */
.ss-tp-section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--tp-cream);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ss-tp-section-title i { color: var(--tp-amber); }

/* ── Séparateur ── */
.ss-tp-divider {
  border: none;
  border-top: 1px solid rgba(212, 146, 42, 0.15);
  margin: 0 0 1rem;
}

/* ── Bio ── */
.ss-tp-bio {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: var(--tp-muted);
  line-height: 1.7;
  margin: 0;
}

/* ── Skills pills ── */
.ss-tp-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.ss-tp-pill {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: rgba(247, 242, 232, 0.75);
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.3rem 0.85rem;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.ss-tp-pill:hover {
  background: var(--tp-amber);
  color: #0C1E1C;
  border-color: var(--tp-amber);
}

/* ── Contact ── */
.ss-tp-contact {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--tp-amber);
}

/* ── Section Avis ── */
.ss-tp-reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.ss-tp-btn-add-review {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: var(--tp-amber);
  color: #0C1E1C;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ss-tp-btn-add-review:hover { background: var(--tp-amber-h); }

/* ── Formulaire avis ── */
.ss-tp-review-form { margin-bottom: 1.5rem; }

.ss-tp-form-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--tp-muted);
  display: block;
  margin-bottom: 0.4rem;
}

.ss-tp-review-stars {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.ss-tp-review-star {
  font-size: 1.6rem;
  color: rgba(247, 242, 232, 0.20);
  cursor: pointer;
  transition: color 0.15s ease, transform 0.15s ease;
}

.ss-tp-review-star:hover { transform: scale(1.2); }

.ss-tp-select,
.ss-tp-textarea {
  width: 100%;
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 8px;
  color: var(--tp-cream);
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  padding: 0.65rem 0.9rem;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s ease;
  appearance: none;
}

.ss-tp-select:focus,
.ss-tp-textarea:focus { border-color: rgba(212, 146, 42, 0.55); }

.ss-tp-select option { background: #0C1E1C; }
.ss-tp-textarea { resize: vertical; min-height: 90px; }
.ss-tp-field { margin-bottom: 1rem; }

.ss-tp-btn-submit {
  width: 100%;
  padding: 0.75rem;
  background: var(--tp-amber);
  color: #0C1E1C;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.ss-tp-btn-submit:hover { background: var(--tp-amber-h); }

/* ── Carte avis ── */
.ss-tp-review-card {
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.15);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
}

.ss-tp-review-meta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.ss-tp-reviewer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ss-tp-reviewer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.20);
  border: 1px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--tp-cream);
  flex-shrink: 0;
}

.ss-tp-reviewer-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--tp-cream);
  text-decoration: none;
}

.ss-tp-reviewer-name:hover { color: var(--tp-amber); }

.ss-tp-review-date {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: var(--tp-dim);
  margin: 0;
}

.ss-tp-review-stars-display i { color: rgba(247, 242, 232, 0.20); font-size: 0.85rem; }
.ss-tp-review-stars-display i.filled { color: var(--tp-amber); }

.ss-tp-review-content {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--tp-muted);
  line-height: 1.6;
  margin: 0;
}

.ss-tp-no-reviews {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--tp-dim);
  text-align: center;
  padding: 2rem;
}

/* ── Sidebar ── */
.ss-tp-sidebar { position: sticky; top: 1.5rem; }

.ss-tp-sidebar-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--tp-cream);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ss-tp-sidebar-title i { color: var(--tp-amber); }

.ss-tp-stat-box {
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.15);
  border-radius: 10px;
  padding: 0.85rem 1rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ss-tp-stat-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  color: var(--tp-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ss-tp-stat-label i { color: var(--tp-amber); }

.ss-tp-stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--tp-amber);
}

/* ── Badge membre ── */
.ss-tp-member-badge {
  text-align: center;
  padding: 1.5rem;
  margin-top: 0;
}

.ss-tp-member-icon {
  font-size: 2.5rem;
  color: var(--tp-amber);
  display: block;
  margin-bottom: 0.75rem;
}

.ss-tp-member-label {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--tp-cream);
  margin: 0 0 0.25rem;
}

.ss-tp-member-date {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: var(--tp-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin: 0;
}

.ss-tp-member-date i { color: var(--tp-amber); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .ss-tp-grid { grid-template-columns: 1fr; }
  .ss-tp-sidebar { position: static; }
}

@media (max-width: 600px) {
  .ss-tp-main { padding: 1.5rem 1rem 3rem; }
  .ss-tp-actions { flex-direction: column; align-items: stretch; }
  .ss-tp-btn-follow, .ss-tp-btn-message { max-width: 100%; }
}
```

**Step 2 : Commit**

```bash
git add public/css/talent.css
git commit -m "style: talent.css — migration Noir Académique, classes ss-tp-"
```

---

## Task 3 : Réécrire `views/pages/talent.ejs`

**Fichiers :**
- Modify (réécriture complète): `views/pages/talent.ejs`

**Step 1 : Remplacer tout le contenu**

> Note : supprimer la ligne `<script src="https://kit.fontawesome.com/626daf36fc.js" ...>` — FA est déjà chargé dans le partial header.

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
<%- include('../partials/navbar.ejs') %>

<main class="ss-tp-main">
  <div class="ss-tp-container">
    <div class="ss-tp-grid">

      <!-- Colonne principale -->
      <div>

        <!-- Header profil -->
        <div class="ss-tp-card ss-tp-header">
          <div class="ss-tp-verified">
            <i class="fa-solid fa-circle-check"></i>
            <span>Vérifié</span>
          </div>

          <div class="ss-tp-avatar">
            <%= profils.firstname.charAt(0).toUpperCase() %><%= profils.lastname.charAt(0).toUpperCase() %>
          </div>

          <h1 class="ss-tp-name"><%= profils.firstname %> <%= profils.lastname %></h1>

          <div class="ss-tp-stars-row">
            <% const fullStars = Math.floor(averageRating); %>
            <% const hasHalf = averageRating % 1 >= 0.5; %>
            <% for (let i = 0; i < fullStars; i++) { %><i class="fa-solid fa-star filled"></i><% } %>
            <% if (hasHalf) { %><i class="fa-solid fa-star-half-stroke filled"></i><% } %>
            <% for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) { %><i class="fa-regular fa-star"></i><% } %>
          </div>
          <span class="ss-tp-rating"><%= averageRating.toFixed(1) %>/5 · <%= reviewCount %> avis</span>

          <div class="ss-tp-actions">
            <button
              class="ss-tp-btn-follow btn-follow <%= isFollowing ? 'is-following' : '' %>"
              data-user-id="<%= profils.id %>"
              data-following="<%= isFollowing ? 'true' : 'false' %>"
            >
              <i class="fa-solid <%= isFollowing ? 'fa-user-minus' : 'fa-user-plus' %>"></i>
              <span><%= isFollowing ? 'Ne plus suivre' : 'Suivre' %></span>
            </button>
            <a href="/messages/<%= profils.id %>" class="ss-tp-btn-message">
              <i class="fa-solid fa-paper-plane"></i>
              <span>Message</span>
            </a>
          </div>
        </div>

        <% if (profils.bio) { %>
        <!-- Bio -->
        <div class="ss-tp-card">
          <h2 class="ss-tp-section-title"><i class="fa-solid fa-user"></i> À propos</h2>
          <hr class="ss-tp-divider">
          <p class="ss-tp-bio"><%= profils.bio %></p>
        </div>
        <% } %>

        <!-- Compétences -->
        <div class="ss-tp-card">
          <h2 class="ss-tp-section-title"><i class="fa-solid fa-certificate"></i> Compétences</h2>
          <hr class="ss-tp-divider">
          <div class="ss-tp-skills">
            <% profils.skills.forEach(skill => { %>
              <a href="/skills/<%= skill.slug %>" class="ss-tp-pill"><%= skill.label %></a>
            <% }) %>
          </div>
        </div>

        <!-- Contact -->
        <div class="ss-tp-card">
          <h2 class="ss-tp-section-title"><i class="fa-solid fa-envelope"></i> Contact</h2>
          <hr class="ss-tp-divider">
          <div class="ss-tp-contact">
            <i class="fa-solid fa-at"></i>
            <span><%= profils.email %></span>
          </div>
        </div>

        <!-- Avis -->
        <div class="ss-tp-card">
          <div class="ss-tp-reviews-header">
            <h2 class="ss-tp-section-title" style="margin:0">
              <i class="fa-solid fa-comments"></i> Avis des utilisateurs
            </h2>
            <% if (typeof user !== 'undefined' && user && user.id !== profils.id) { %>
              <button class="ss-tp-btn-add-review" id="btn-toggle-review-form">
                <i class="fa-solid fa-plus"></i>
                <span>Laisser un avis</span>
              </button>
            <% } %>
          </div>

          <% if (typeof user !== 'undefined' && user && user.id !== profils.id) { %>
          <div id="review-form-container" style="display:none;" class="ss-tp-review-form">
            <div class="ss-tp-card">
              <form action="/review/<%= profils.id %>" method="POST">
                <div class="ss-tp-field">
                  <label class="ss-tp-form-label">Note</label>
                  <input type="hidden" name="rate" id="review-rate" value="0">
                  <div class="ss-tp-review-stars">
                    <% for (let i = 1; i <= 5; i++) { %>
                      <span class="ss-tp-review-star" data-value="<%= i %>">
                        <i class="far fa-star"></i>
                      </span>
                    <% } %>
                  </div>
                </div>
                <div class="ss-tp-field">
                  <label class="ss-tp-form-label">Compétence évaluée</label>
                  <select name="skill_id" required class="ss-tp-select">
                    <option value="">-- Choisir une compétence --</option>
                    <% profils.skills.forEach(skill => { %>
                      <option value="<%= skill.id %>"><%= skill.label %></option>
                    <% }) %>
                  </select>
                </div>
                <div class="ss-tp-field">
                  <label class="ss-tp-form-label">Commentaire</label>
                  <textarea name="content" class="ss-tp-textarea" placeholder="Décrivez votre expérience..." rows="3"></textarea>
                </div>
                <button type="submit" class="ss-tp-btn-submit">
                  <i class="fa-solid fa-paper-plane"></i>
                  Envoyer mon avis
                </button>
              </form>
            </div>
          </div>
          <% } %>

          <!-- Liste avis -->
          <% if (reviews.length === 0) { %>
            <p class="ss-tp-no-reviews">Aucun avis pour le moment.</p>
          <% } %>

          <% reviews.forEach((review) => { %>
            <div class="ss-tp-review-card">
              <div class="ss-tp-review-meta">
                <div class="ss-tp-reviewer">
                  <div class="ss-tp-reviewer-avatar">
                    <%= review.reviewer.firstname.charAt(0).toUpperCase() %><%= review.reviewer.lastname.charAt(0).toUpperCase() %>
                  </div>
                  <div>
                    <a href="/talents/<%= review.reviewer.id %>" class="ss-tp-reviewer-name">
                      <%= review.reviewer.firstname %> <%= review.reviewer.lastname %>
                    </a>
                    <p class="ss-tp-review-date">
                      <%= new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) %>
                    </p>
                  </div>
                </div>
                <div class="ss-tp-review-stars-display">
                  <% for (let i = 0; i < review.rate; i++) { %><i class="fa-solid fa-star filled"></i><% } %>
                  <% for (let i = review.rate; i < 5; i++) { %><i class="fa-regular fa-star"></i><% } %>
                </div>
              </div>
              <% if (review.content) { %>
                <p class="ss-tp-review-content"><%= review.content %></p>
              <% } %>
            </div>
          <% }) %>

        </div><!-- /.ss-tp-card avis -->

      </div><!-- /colonne principale -->

      <!-- Sidebar -->
      <div class="ss-tp-sidebar">
        <div class="ss-tp-card">
          <h3 class="ss-tp-sidebar-title">
            <i class="fa-solid fa-chart-line"></i> Statistiques
          </h3>
          <div class="ss-tp-stat-box">
            <span class="ss-tp-stat-label"><i class="fa-solid fa-certificate"></i> Compétences</span>
            <span class="ss-tp-stat-value"><%= profils.skills.length %></span>
          </div>
          <div class="ss-tp-stat-box">
            <span class="ss-tp-stat-label"><i class="fa-solid fa-comments"></i> Avis reçus</span>
            <span class="ss-tp-stat-value"><%= reviewCount %></span>
          </div>
          <div class="ss-tp-stat-box">
            <span class="ss-tp-stat-label"><i class="fa-solid fa-users"></i> Abonnés</span>
            <span class="ss-tp-stat-value"><%= followerCount %></span>
          </div>
        </div>

        <div class="ss-tp-card ss-tp-member-badge">
          <i class="fa-solid fa-award ss-tp-member-icon"></i>
          <p class="ss-tp-member-label">Membre Vérifié</p>
          <p class="ss-tp-member-date">
            <i class="fa-solid fa-calendar-check"></i>
            Membre depuis <%= new Date(profils.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) %>
          </p>
        </div>
      </div><!-- /sidebar -->

    </div><!-- /.ss-tp-grid -->
  </div>
</main>

<script src="/js/follow.js"></script>
<script src="/js/review.js"></script>
<script nonce="<%= cspNonce %>">
  const toggleBtn = document.getElementById('btn-toggle-review-form');
  const formContainer = document.getElementById('review-form-container');
  if (toggleBtn && formContainer) {
    toggleBtn.addEventListener('click', () => {
      formContainer.style.display = formContainer.style.display === 'none' ? 'block' : 'none';
    });
  }
</script>

<%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Commit**

```bash
git add views/pages/talent.ejs
git commit -m "feat: talent.ejs — réécriture Noir Académique, suppression Bulma et CDN FA"
```

---

## Task 4 : Mettre à jour `public/js/review.js`

**Fichiers :**
- Modify: `public/js/review.js`

**Step 1 : Mettre à jour le sélecteur et les couleurs**

Le nouveau sélecteur est `.ss-tp-review-star` (au lieu de `.review-star`).
La couleur active devient `#D4922A` (amber) au lieu de `#ffd700`.
La couleur inactive devient `rgba(247, 242, 232, 0.20)` au lieu de `#ccc`.

```js
document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.ss-tp-review-star');
  const rateInput = document.getElementById('review-rate');

  if (!stars.length || !rateInput) return;

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      rateInput.value = value;

      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        const icon = s.querySelector('i');
        if (v <= value) {
          icon.className = 'fas fa-star';
          s.style.color = '#D4922A';
        } else {
          icon.className = 'far fa-star';
          s.style.color = 'rgba(247, 242, 232, 0.20)';
        }
      });
    });

    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value);
      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        const icon = s.querySelector('i');
        if (v <= value) {
          icon.className = 'fas fa-star';
          s.style.color = '#D4922A';
        }
      });
    });

    star.addEventListener('mouseleave', () => {
      const currentValue = parseInt(rateInput.value) || 0;
      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        const icon = s.querySelector('i');
        if (v <= currentValue) {
          icon.className = 'fas fa-star';
          s.style.color = '#D4922A';
        } else {
          icon.className = 'far fa-star';
          s.style.color = 'rgba(247, 242, 232, 0.20)';
        }
      });
    });
  });
});
```

**Step 2 : Tester manuellement**

Démarrer le serveur et ouvrir le profil d'un talent (en étant connecté avec un compte différent).
Cliquer sur « Laisser un avis » → le formulaire s'affiche.
Survoler les étoiles → elles deviennent amber (#D4922A).
Cliquer sur une étoile → la valeur se fixe.

**Step 3 : Commit**

```bash
git add public/js/review.js
git commit -m "fix: review.js — sélecteur ss-tp-review-star, couleurs amber Noir Académique"
```

---

## Task 5 : Réécrire `public/css/skill.css`

**Fichiers :**
- Modify (réécriture complète): `public/css/skill.css`

**Step 1 : Remplacer tout le contenu**

```css
/* ===== Page Compétence Détail — Noir Académique ===== */
:root {
  --sp-bg:       #0C1E1C;
  --sp-card:     rgba(14, 34, 32, 0.72);
  --sp-border:   rgba(212, 146, 42, 0.18);
  --sp-border-h: rgba(212, 146, 42, 0.35);
  --sp-amber:    #D4922A;
  --sp-amber-h:  #E8A63C;
  --sp-cream:    #F7F2E8;
  --sp-muted:    rgba(247, 242, 232, 0.65);
  --sp-dim:      rgba(247, 242, 232, 0.40);
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--sp-bg);
}

footer { width: 100%; margin-top: auto; }

.ss-sp-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Main ── */
.ss-sp-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-sp-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Header compétence ── */
.ss-sp-header {
  background: var(--sp-card);
  border: 1px solid var(--sp-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 3rem 2rem;
  text-align: center;
  margin-bottom: 2.5rem;
}

.ss-sp-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.15);
  border: 1px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--sp-amber);
  margin: 0 auto 1.25rem;
  transition: background 0.25s ease, color 0.25s ease;
}

.ss-sp-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--sp-amber);
  margin: 0 0 1rem;
}

.ss-sp-counter {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 20px;
  padding: 0.4rem 1.25rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--sp-muted);
  margin-bottom: 1rem;
}

.ss-sp-counter i { color: var(--sp-amber); }

.ss-sp-tags {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.ss-sp-tag {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.3rem 0.85rem;
  color: var(--sp-amber);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

/* ── Section talents ── */
.ss-sp-section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--sp-cream);
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ss-sp-section-title i { color: var(--sp-amber); }

/* ── Grille talents ── */
.ss-sp-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

/* ── Carte talent ── */
.ss-sp-card-link { text-decoration: none; display: block; }

.ss-sp-card {
  background: var(--sp-card);
  border: 1px solid var(--sp-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.5rem 1rem;
  text-align: center;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.ss-sp-card-link:hover .ss-sp-card {
  transform: translateY(-6px);
  border-color: var(--sp-border-h);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.ss-sp-card-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.20);
  border: 2px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  font-size: 1.5rem;
  color: var(--sp-amber);
  transition: background 0.25s ease, color 0.25s ease;
}

.ss-sp-card-link:hover .ss-sp-card-avatar {
  background: var(--sp-amber);
  color: #0C1E1C;
}

.ss-sp-card-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--sp-cream);
  margin: 0;
  transition: color 0.2s ease;
}

.ss-sp-card-link:hover .ss-sp-card-name { color: var(--sp-amber); }

/* ── Empty state ── */
.ss-sp-empty {
  background: var(--sp-card);
  border: 1px dashed rgba(212, 146, 42, 0.30);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 3rem 2rem;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.ss-sp-empty-icon {
  font-size: 5rem;
  color: var(--sp-amber);
  opacity: 0.25;
  display: block;
  margin-bottom: 1.25rem;
}

.ss-sp-empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--sp-cream);
  margin: 0 0 0.75rem;
}

.ss-sp-empty-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--sp-muted);
  margin: 0 0 1.5rem;
}

/* ── Suggestions ── */
.ss-sp-suggestions {
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.15);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  text-align: left;
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.ss-sp-suggestions-title {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--sp-cream);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ss-sp-suggestions-title i { color: var(--sp-amber); }

.ss-sp-suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ss-sp-suggestion-list li {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: var(--sp-muted);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.ss-sp-suggestion-list li i { color: var(--sp-amber); }

/* ── Bouton retour ── */
.ss-sp-back-wrap { text-align: center; margin-top: 2rem; }

.ss-sp-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  background: transparent;
  border: 1px solid var(--sp-amber);
  color: var(--sp-amber);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.ss-sp-back-btn:hover {
  background: var(--sp-amber);
  color: #0C1E1C;
}

/* ── Responsive ── */
@media (max-width: 900px) { .ss-sp-grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 600px) {
  .ss-sp-grid { grid-template-columns: 1fr; }
  .ss-sp-main { padding: 1.5rem 1rem 3rem; }
}

@media (max-width: 480px) { .ss-sp-header { padding: 2rem 1rem; } }
```

**Step 2 : Commit**

```bash
git add public/css/skill.css
git commit -m "style: skill.css — migration Noir Académique, classes ss-sp-"
```

---

## Task 6 : Réécrire `views/pages/skill.ejs`

**Fichiers :**
- Modify (réécriture complète): `views/pages/skill.ejs`

**Step 1 : Remplacer tout le contenu**

> Suppressions : stats hardcodées (42 projets, 89% succès), note "4.5", badge "Expert", badges "Top 1/2/3", bouton "M'alerter" non fonctionnel.

```ejs
<%- include('../partials/header.ejs') %>
</head>
<%- include('../partials/navbar.ejs') %>

<div class="ss-sp-page">
  <main class="ss-sp-main">
    <div class="ss-sp-container">

      <!-- Header compétence -->
      <div class="ss-sp-header">
        <div class="ss-sp-icon-wrap">
          <i class="fa-solid <%= skill.icon || 'fa-code' %>"></i>
        </div>
        <h1 class="ss-sp-title"><%= skill.label %></h1>
        <div class="ss-sp-counter">
          <i class="fa-solid fa-users"></i>
          <span><%= skill.users.length %> <%= skill.users.length > 1 ? 'talents disponibles' : 'talent disponible' %></span>
        </div>
        <div class="ss-sp-tags">
          <span class="ss-sp-tag"><i class="fa-solid fa-fire"></i> Populaire</span>
          <span class="ss-sp-tag"><i class="fa-solid fa-star"></i> Demandée</span>
        </div>
      </div>

      <% if (skill.users.length > 0) { %>
        <h2 class="ss-sp-section-title">
          <i class="fa-solid fa-user-check"></i>
          Talents maîtrisant cette compétence
        </h2>

        <div class="ss-sp-grid">
          <% skill.users.forEach((user) => { %>
            <a href="/talents/<%= user.id %>" class="ss-sp-card-link">
              <div class="ss-sp-card">
                <div class="ss-sp-card-avatar">
                  <i class="fa-solid fa-user"></i>
                </div>
                <p class="ss-sp-card-name"><%= user.firstname %></p>
              </div>
            </a>
          <% }) %>
        </div>

      <% } else { %>

        <div class="ss-sp-empty">
          <i class="fa-solid fa-users-slash ss-sp-empty-icon"></i>
          <h3 class="ss-sp-empty-title">Aucun talent disponible</h3>
          <p class="ss-sp-empty-text">Cette compétence n'a pas encore de talents inscrits. Soyez le premier !</p>
          <div class="ss-sp-suggestions">
            <p class="ss-sp-suggestions-title">
              <i class="fa-solid fa-lightbulb"></i> Que faire en attendant ?
            </p>
            <ul class="ss-sp-suggestion-list">
              <li><i class="fa-solid fa-bell"></i> Activez les notifications pour cette compétence</li>
              <li><i class="fa-solid fa-share-nodes"></i> Partagez cette compétence avec votre réseau</li>
              <li><i class="fa-solid fa-compass"></i> Explorez des compétences similaires</li>
            </ul>
          </div>
        </div>

      <% } %>

      <!-- Bouton retour -->
      <div class="ss-sp-back-wrap">
        <a href="/skills" class="ss-sp-back-btn">
          <i class="fa-solid fa-arrow-left"></i>
          Retour aux compétences
        </a>
      </div>

    </div>
  </main>
</div>

<%- include('../partials/footer.ejs') %>

</body>
</html>
```

**Step 2 : Commit**

```bash
git add views/pages/skill.ejs
git commit -m "feat: skill.ejs — réécriture Noir Académique, suppression Bulma et données fictives"
```

---

## Task 7 : Réécrire `public/css/notifications.css`

**Fichiers :**
- Modify (réécriture complète): `public/css/notifications.css`

**Step 1 : Remplacer tout le contenu**

```css
/* ===== Page Notifications — Noir Académique ===== */
:root {
  --notif-bg:       #0C1E1C;
  --notif-card:     rgba(14, 34, 32, 0.72);
  --notif-border:   rgba(212, 146, 42, 0.18);
  --notif-border-h: rgba(212, 146, 42, 0.35);
  --notif-amber:    #D4922A;
  --notif-amber-h:  #E8A63C;
  --notif-cream:    #F7F2E8;
  --notif-muted:    rgba(247, 242, 232, 0.65);
  --notif-dim:      rgba(247, 242, 232, 0.40);
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--notif-bg);
}

footer { width: 100%; margin-top: auto; }

/* ── Main ── */
.ss-notif-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-notif-container {
  max-width: 720px;
  margin: 0 auto;
}

/* ── Header ── */
.ss-notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.ss-notif-title-wrap { flex: 1; }

.ss-notif-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  font-weight: 600;
  font-style: italic;
  color: var(--notif-amber);
  margin: 0 0 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ss-notif-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--notif-muted);
  margin: 0;
}

.ss-notif-mark-all {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  background: transparent;
  border: 1px solid var(--notif-amber);
  color: var(--notif-amber);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.ss-notif-mark-all:hover {
  background: var(--notif-amber);
  color: #0C1E1C;
}

/* ── Empty state ── */
.ss-notif-empty {
  background: var(--notif-card);
  border: 1px solid var(--notif-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 4rem 2rem;
  text-align: center;
}

.ss-notif-empty-icon {
  font-size: 4rem;
  color: var(--notif-amber);
  opacity: 0.3;
  display: block;
  margin-bottom: 1rem;
}

.ss-notif-empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  color: var(--notif-cream);
  margin: 0 0 0.5rem;
}

.ss-notif-empty-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--notif-muted);
  margin: 0;
}

/* ── Item ── */
.ss-notif-item {
  background: var(--notif-card);
  border: 1px solid var(--notif-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.ss-notif-item:hover {
  transform: translateX(4px);
  border-color: var(--notif-border-h);
}

.ss-notif-item--unread {
  border-color: var(--notif-border-h);
  box-shadow: inset 3px 0 0 var(--notif-amber);
}

/* ── Icône par type (uniforme amber) ── */
.ss-notif-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.15);
  border: 1px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--notif-amber);
  flex-shrink: 0;
  font-size: 1rem;
}

/* ── Contenu ── */
.ss-notif-content { flex: 1; min-width: 0; }

.ss-notif-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--notif-cream);
  line-height: 1.4;
  margin: 0 0 0.2rem;
}

.ss-notif-time {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: var(--notif-dim);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin: 0;
}

/* ── Actions ── */
.ss-notif-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.ss-notif-read-btn,
.ss-notif-view-btn,
.ss-notif-delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: background 0.2s ease, color 0.2s ease;
  text-decoration: none;
}

.ss-notif-read-btn {
  background: transparent;
  border: 1px solid var(--notif-amber);
  color: var(--notif-amber);
}

.ss-notif-read-btn:hover {
  background: var(--notif-amber);
  color: #0C1E1C;
}

.ss-notif-view-btn {
  background: var(--notif-amber);
  color: #0C1E1C;
}

.ss-notif-view-btn:hover { background: var(--notif-amber-h); }

.ss-notif-delete-btn {
  background: transparent;
  color: var(--notif-dim);
}

.ss-notif-delete-btn:hover {
  background: rgba(220, 80, 80, 0.55);
  color: var(--notif-cream);
}

/* ── Pagination ── */
.ss-notif-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 0 0;
  flex-wrap: wrap;
}

.ss-notif-page-link {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(212, 146, 42, 0.30);
  color: var(--notif-amber);
  text-decoration: none;
  transition: all 0.2s ease;
}

.ss-notif-page-link:hover,
.ss-notif-page-link--active {
  background: var(--notif-amber);
  border-color: var(--notif-amber);
  color: #0C1E1C;
}

.ss-notif-page-link[disabled] {
  opacity: 0.35;
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .ss-notif-main { padding: 1.5rem 1rem 3rem; }
  .ss-notif-actions { flex-direction: column; gap: 0.3rem; }
}

@media (max-width: 480px) {
  .ss-notif-icon-box { width: 36px; height: 36px; }
  .ss-notif-text { font-size: 0.85rem; }
}
```

**Step 2 : Commit**

```bash
git add public/css/notifications.css
git commit -m "style: notifications.css — migration Noir Académique, classes ss-notif-"
```

---

## Task 8 : Réécrire `views/pages/notifications.ejs`

**Fichiers :**
- Modify (réécriture complète): `views/pages/notifications.ejs`

**Step 1 : Remplacer tout le contenu**

> Les sélecteurs JS inline sont mis à jour : `notif-unread` → `ss-notif-item--unread`, `notif-read-btn` → `ss-notif-read-btn`, etc.

```ejs
<%- include('../partials/header.ejs') %>
</head>
<%- include('../partials/navbar.ejs') %>

<main class="ss-notif-main">
  <div class="ss-notif-container">

    <!-- Header -->
    <div class="ss-notif-header">
      <div class="ss-notif-title-wrap">
        <h1 class="ss-notif-title">
          <i class="fa-solid fa-bell"></i>
          Notifications
        </h1>
        <p class="ss-notif-subtitle">
          <% if (unreadCount > 0) { %>
            Vous avez <strong style="color:var(--notif-amber)"><%= unreadCount %></strong>
            notification<%= unreadCount > 1 ? 's' : '' %> non lue<%= unreadCount > 1 ? 's' : '' %>
          <% } else { %>
            Toutes vos notifications sont lues
          <% } %>
        </p>
      </div>
      <% if (unreadCount > 0) { %>
        <button class="ss-notif-mark-all" id="markAllReadBtn">
          <i class="fa-solid fa-check-double"></i>
          <span>Tout marquer comme lu</span>
        </button>
      <% } %>
    </div>

    <!-- Contenu -->
    <% if (notifications.length === 0) { %>
      <div class="ss-notif-empty">
        <i class="fa-solid fa-bell-slash ss-notif-empty-icon"></i>
        <h3 class="ss-notif-empty-title">Aucune notification</h3>
        <p class="ss-notif-empty-text">Vous n'avez pas encore reçu de notifications.</p>
      </div>
    <% } else { %>
      <div class="ss-notif-list">
        <% notifications.forEach((notif) => { %>
          <div class="ss-notif-item <%= notif.is_read ? '' : 'ss-notif-item--unread' %>" data-id="<%= notif.id %>">

            <!-- Icône -->
            <div class="ss-notif-icon-box">
              <% if (notif.type_notification === 'message') { %>
                <i class="fa-solid fa-envelope"></i>
              <% } else if (notif.type_notification === 'review') { %>
                <i class="fa-solid fa-star"></i>
              <% } else if (notif.type_notification === 'follow') { %>
                <i class="fa-solid fa-user-plus"></i>
              <% } else { %>
                <i class="fa-solid fa-bell"></i>
              <% } %>
            </div>

            <!-- Contenu -->
            <div class="ss-notif-content">
              <p class="ss-notif-text"><%= notif.content %></p>
              <p class="ss-notif-time">
                <i class="fa-regular fa-clock"></i>
                <%= new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) %>
              </p>
            </div>

            <!-- Actions -->
            <div class="ss-notif-actions">
              <% if (!notif.is_read) { %>
                <button class="ss-notif-read-btn" data-id="<%= notif.id %>" title="Marquer comme lu">
                  <i class="fa-solid fa-check"></i>
                </button>
              <% } %>
              <% if (notif.action_url) { %>
                <a href="<%= notif.action_url %>" class="ss-notif-view-btn" title="Voir">
                  <i class="fa-solid fa-arrow-right"></i>
                </a>
              <% } %>
              <button class="ss-notif-delete-btn" data-id="<%= notif.id %>" title="Supprimer">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

          </div>
        <% }) %>
      </div>

      <!-- Pagination -->
      <% if (totalPages > 1) { %>
        <nav class="ss-notif-pagination" aria-label="pagination">
          <% if (currentPage > 1) { %>
            <a class="ss-notif-page-link" href="/notifications?page=<%= currentPage - 1 %>">← Précédent</a>
          <% } else { %>
            <a class="ss-notif-page-link" disabled>← Précédent</a>
          <% } %>

          <% for (let i = 1; i <= totalPages; i++) { %>
            <a class="ss-notif-page-link <%= i === currentPage ? 'ss-notif-page-link--active' : '' %>"
               href="/notifications?page=<%= i %>"><%= i %></a>
          <% } %>

          <% if (currentPage < totalPages) { %>
            <a class="ss-notif-page-link" href="/notifications?page=<%= currentPage + 1 %>">Suivant →</a>
          <% } else { %>
            <a class="ss-notif-page-link" disabled>Suivant →</a>
          <% } %>
        </nav>
      <% } %>
    <% } %>

  </div>
</main>

<script nonce="<%= cspNonce %>">
  document.querySelectorAll('.ss-notif-read-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (res.ok) {
        const item = btn.closest('.ss-notif-item');
        item.classList.remove('ss-notif-item--unread');
        btn.remove();
      }
    });
  });

  document.querySelectorAll('.ss-notif-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const res = await fetch(`/api/notifications/${id}/delete`, { method: 'POST' });
      if (res.ok) { btn.closest('.ss-notif-item').remove(); }
    });
  });

  const markAllBtn = document.getElementById('markAllReadBtn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async () => {
      const res = await fetch('/api/notifications/read-all', { method: 'POST' });
      if (res.ok) {
        document.querySelectorAll('.ss-notif-item--unread').forEach(el => el.classList.remove('ss-notif-item--unread'));
        document.querySelectorAll('.ss-notif-read-btn').forEach(btn => btn.remove());
        markAllBtn.remove();
      }
    });
  }
</script>

<%- include('../partials/footer.ejs') %>

</body>
</html>
```

**Step 2 : Commit**

```bash
git add views/pages/notifications.ejs
git commit -m "feat: notifications.ejs — réécriture Noir Académique, suppression Bulma"
```

---

## Task 9 : Réécrire la section `msg-` de `public/css/messages.css`

**Fichiers :**
- Modify (section msg- seulement): `public/css/messages.css`

**ATTENTION :** Ce fichier contient aussi les styles `conv-` pour `conversation.ejs`.
**Ne supprimer que les lignes 1 à 148** (section `msg-`). Garder à partir de la ligne 149 (`/* ══════ Conversation page (conv- prefix) ══════ */`).

**Step 1 : Remplacer les lignes 1–148 par le nouveau code**

> Garder intact tout ce qui commence par `.conv-` (section conversation).

```css
html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0C1E1C;
}

footer { width: 100%; margin-top: auto; }

/* ══════════════════════════════════════
   Messages list page (ss-msg- prefix)
   ══════════════════════════════════════ */

.ss-msg-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-msg-container {
  max-width: 700px;
  margin: 0 auto;
}

/* Header */
.ss-msg-header { text-align: center; margin-bottom: 2rem; }

.ss-msg-header-icon {
  font-size: 3rem;
  color: #D4922A;
  display: block;
  margin-bottom: 1rem;
}

.ss-msg-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 2.75rem);
  font-weight: 600;
  font-style: italic;
  color: #D4922A;
  margin: 0 0 0.4rem;
}

.ss-msg-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: rgba(247, 242, 232, 0.65);
  margin: 0;
}

/* Empty state */
.ss-msg-empty {
  background: rgba(14, 34, 32, 0.72);
  border: 1px solid rgba(212, 146, 42, 0.18);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 4rem 2rem;
  text-align: center;
}

.ss-msg-empty-icon {
  font-size: 4rem;
  color: #D4922A;
  opacity: 0.3;
  display: block;
  margin-bottom: 1rem;
}

.ss-msg-empty-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.4rem;
  color: #F7F2E8;
  margin: 0 0 0.75rem;
}

.ss-msg-empty-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: rgba(247, 242, 232, 0.65);
  margin: 0 0 1.5rem;
}

.ss-msg-empty-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #D4922A;
  color: #0C1E1C;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease;
}

.ss-msg-empty-btn:hover { background: #E8A63C; }

/* Conversation items */
.ss-msg-conv-link { text-decoration: none; display: block; }

.ss-msg-conv-card {
  background: rgba(14, 34, 32, 0.72);
  border: 1px solid rgba(212, 146, 42, 0.18);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.ss-msg-conv-link:hover .ss-msg-conv-card {
  transform: translateY(-4px);
  border-color: rgba(212, 146, 42, 0.35);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.ss-msg-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.20);
  border: 2px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ss-msg-avatar-initials {
  font-family: 'Outfit', sans-serif;
  color: #F7F2E8;
  font-weight: 700;
  font-size: 1.1rem;
}

.ss-msg-conv-content { flex: 1; min-width: 0; }

.ss-msg-conv-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
}

.ss-msg-conv-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #F7F2E8;
  margin: 0;
}

.ss-msg-conv-date {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: rgba(247, 242, 232, 0.40);
}

.ss-msg-conv-preview {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: rgba(247, 242, 232, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.ss-msg-unread-badge {
  background: #D4922A;
  color: #0C1E1C;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 600px) { .ss-msg-main { padding: 1.5rem 1rem 3rem; } }

@media (max-width: 480px) {
  .ss-msg-avatar { width: 44px; height: 44px; }
  .ss-msg-avatar-initials { font-size: 0.9rem; }
}
```

**Step 2 : Vérifier que les règles `conv-` sont toujours présentes**

Ouvrir `public/css/messages.css` et s'assurer que la section `/* ══════ Conversation page (conv- prefix) ══════ */` est toujours là.

**Step 3 : Commit**

```bash
git add public/css/messages.css
git commit -m "style: messages.css — réécriture section msg- Noir Académique, conservation conv-"
```

---

## Task 10 : Réécrire `views/pages/messages.ejs`

**Fichiers :**
- Modify (réécriture complète): `views/pages/messages.ejs`

**Step 1 : Remplacer tout le contenu**

> Supprimer la ligne `<script src="https://kit.fontawesome.com/626daf36fc.js" ...>` — FA déjà dans le header partial.

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
<%- include('../partials/navbar.ejs') %>

<main class="ss-msg-main">
  <div class="ss-msg-container">

    <!-- Header -->
    <div class="ss-msg-header">
      <i class="fas fa-envelope ss-msg-header-icon"></i>
      <h1 class="ss-msg-title">Mes Messages</h1>
      <p class="ss-msg-subtitle">
        <%= conversations.length %> conversation<%= conversations.length > 1 ? 's' : '' %>
      </p>
    </div>

    <% if (conversations.length === 0) { %>
      <div class="ss-msg-empty">
        <i class="fas fa-comments ss-msg-empty-icon"></i>
        <p class="ss-msg-empty-title">Aucune conversation</p>
        <p class="ss-msg-empty-text">
          Envoyez un message depuis le profil d'un talent pour commencer une conversation.
        </p>
        <a href="/talents" class="ss-msg-empty-btn">
          <i class="fas fa-users"></i>
          <span>Voir les talents</span>
        </a>
      </div>
    <% } else { %>
      <div class="ss-msg-conv-list">
        <% conversations.forEach((conv) => { %>
          <a href="/messages/<%= conv.user.id %>" class="ss-msg-conv-link">
            <div class="ss-msg-conv-card">
              <!-- Avatar -->
              <div class="ss-msg-avatar">
                <span class="ss-msg-avatar-initials">
                  <%= conv.user.firstname.charAt(0).toUpperCase() %><%= conv.user.lastname.charAt(0).toUpperCase() %>
                </span>
              </div>
              <!-- Contenu -->
              <div class="ss-msg-conv-content">
                <div class="ss-msg-conv-header">
                  <p class="ss-msg-conv-name"><%= conv.user.firstname %> <%= conv.user.lastname %></p>
                  <span class="ss-msg-conv-date">
                    <%= new Date(conv.lastMessage.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) %>
                  </span>
                </div>
                <p class="ss-msg-conv-preview"><%= conv.lastMessage.content %></p>
              </div>
              <!-- Badge non-lu -->
              <% if (conv.unreadCount > 0) { %>
                <span class="ss-msg-unread-badge"><%= conv.unreadCount %></span>
              <% } %>
            </div>
          </a>
        <% }) %>
      </div>
    <% } %>

  </div>
</main>

<%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Commit**

```bash
git add views/pages/messages.ejs
git commit -m "feat: messages.ejs — réécriture Noir Académique, suppression Bulma et CDN FA"
```

---

## Vérification finale

Démarrer le serveur : `node index.js`

Checklist page par page :

**`/talents/<id>` (talent.ejs)**
- [ ] Fond sombre `#0C1E1C`
- [ ] Layout 2 colonnes (main + sidebar) ≥ 900px, 1 colonne en dessous
- [ ] Header profil : badge amber, avatar amber, étoiles amber/cream
- [ ] Boutons "Suivre" (outline amber) et "Message" (amber plein)
- [ ] Section avis : formulaire glass, étoiles amber au clic/hover
- [ ] Cartes avis : fond glass uniforme (pas de couleurs alternées)
- [ ] Sidebar : stat-boxes glass, badge membre amber

**`/skills/<slug>` (skill.ejs)**
- [ ] Fond sombre `#0C1E1C`
- [ ] Header : carte glass, icône amber dans cercle
- [ ] Grille talents : cartes glass uniformes, 4 colonnes → 2 → 1
- [ ] Aucune stat fictive (pas de "4.5", "42 projets", "89%", "Expert", "Top 1")
- [ ] Bouton retour : outline amber
- [ ] Empty state : carte glass avec dashed border amber

**`/notifications` (notifications.ejs)**
- [ ] Fond sombre `#0C1E1C`
- [ ] Items non lus : bordure amber + barre latérale amber inset
- [ ] Icônes de type : toutes amber uniforme (pas de gradients rose/bleu)
- [ ] Boutons actions fonctionnels (marquer lu, supprimer, voir)

**`/messages` (messages.ejs)**
- [ ] Fond sombre `#0C1E1C`
- [ ] Cartes conversations : glass uniformes (pas d'alternance 4 couleurs)
- [ ] Avatar : cercle amber 0.20
- [ ] Badge non-lu : amber plein
