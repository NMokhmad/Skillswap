# Talents Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réécrire `views/pages/talents.ejs` et `public/css/talents.css` en supprimant Bulma et en appliquant l'esthétique "Noir Académique" (fond `#0C1E1C`, amber `#D4922A`, glass cards).

**Architecture:** Page de listing avec header pleine largeur + grille CSS 3 colonnes. Cartes glass amber avec avatar (photo ou initiales), étoiles, pills compétences, boutons Suivre/Message. `follow.js` conservé tel quel — le bouton garde la classe `.btn-follow` en plus de `.ss-tal-follow`.

**Tech Stack:** EJS, CSS pur (Grid, Flexbox, Custom Properties), Font Awesome, Cormorant Garamond + Outfit (déjà chargés via header.ejs)

---

### Task 1 : CSS — réécriture complète de `public/css/talents.css`

**Files:**
- Modify: `public/css/talents.css`

**Step 1 : Remplacer tout le contenu de `public/css/talents.css` par le CSS suivant**

```css
/* ===== Page Talents — Noir Académique ===== */
:root {
  --tal-bg:      #0C1E1C;
  --tal-card:    rgba(14, 34, 32, 0.72);
  --tal-border:  rgba(212, 146, 42, 0.18);
  --tal-amber:   #D4922A;
  --tal-amber-h: #E8A63C;
  --tal-cream:   #F7F2E8;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--tal-bg);
}

footer {
  width: 100%;
  margin-top: auto;
}

.ss-tal-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.ss-tal-header {
  background: rgba(14, 34, 32, 0.60);
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  padding: 4rem 1.5rem;
  text-align: center;
}

.ss-tal-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--tal-amber);
  margin: 0 0 0.5rem;
}

.ss-tal-title em { font-style: normal; }

.ss-tal-subtitle {
  font-family: 'Outfit', sans-serif;
  color: rgba(247, 242, 232, 0.65);
  font-size: 1rem;
  margin: 0 0 2rem;
}

.ss-tal-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ss-tal-stat-box {
  background: var(--tal-card);
  border: 1px solid var(--tal-border);
  border-radius: 12px;
  padding: 0.75rem 1.75rem;
  backdrop-filter: blur(10px);
  text-align: center;
}

.ss-tal-stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--tal-amber);
  display: block;
}

.ss-tal-stat-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: rgba(247, 242, 232, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Body ── */
.ss-tal-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  width: 100%;
  box-sizing: border-box;
}

/* ── Grid ── */
.ss-tal-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* ── Card ── */
.ss-tal-card {
  background: var(--tal-card);
  border: 1px solid var(--tal-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  text-align: center;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.ss-tal-card:hover {
  transform: translateY(-6px);
  border-color: rgba(212, 146, 42, 0.35);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

/* ── Avatar ── */
.ss-tal-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--tal-cream);
  background: rgba(212, 146, 42, 0.20);
  border: 2px solid rgba(212, 146, 42, 0.30);
  overflow: hidden;
  flex-shrink: 0;
}

.ss-tal-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Name ── */
.ss-tal-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--tal-cream);
  text-decoration: none;
  transition: color 0.2s ease;
}

.ss-tal-name:hover { color: var(--tal-amber); }

/* ── Stars ── */
.ss-tal-stars {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.ss-tal-stars-row i {
  font-size: 0.9rem;
  color: rgba(247, 242, 232, 0.20);
}

.ss-tal-stars-row i.filled { color: var(--tal-amber); }

.ss-tal-rating {
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  color: rgba(247, 242, 232, 0.50);
}

/* ── Skills pills ── */
.ss-tal-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: center;
  flex: 1;
}

.ss-tal-pill {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: rgba(247, 242, 232, 0.75);
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.25rem 0.75rem;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
}

.ss-tal-pill:hover {
  background: var(--tal-amber);
  color: #0C1E1C;
  border-color: var(--tal-amber);
}

/* ── Action buttons ── */
.ss-tal-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.ss-tal-follow,
.ss-tal-message {
  flex: 1;
  padding: 0.6rem 0.5rem;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  text-decoration: none;
}

.ss-tal-follow {
  background: transparent;
  border: 1px solid var(--tal-amber);
  color: var(--tal-amber);
}

.ss-tal-follow:hover,
.ss-tal-follow.is-following {
  background: var(--tal-amber);
  color: #0C1E1C;
}

.ss-tal-message {
  background: var(--tal-amber);
  border: 1px solid var(--tal-amber);
  color: #0C1E1C;
}

.ss-tal-message:hover {
  background: var(--tal-amber-h);
  border-color: var(--tal-amber-h);
  transform: translateY(-1px);
}

/* ── Pagination ── */
.ss-tal-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 0 0;
  flex-wrap: wrap;
}

.ss-tal-page-link {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  border: 1px solid rgba(212, 146, 42, 0.30);
  color: var(--tal-amber);
  text-decoration: none;
  transition: all 0.2s ease;
}

.ss-tal-page-link:hover,
.ss-tal-page-link.is-current {
  background: var(--tal-amber);
  border-color: var(--tal-amber);
  color: #0C1E1C;
}

.ss-tal-page-link[disabled] {
  opacity: 0.35;
  pointer-events: none;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .ss-tal-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .ss-tal-grid { grid-template-columns: 1fr; }
  .ss-tal-body { padding: 1.5rem 1rem 3rem; }
}

@media (max-width: 480px) {
  .ss-tal-header { padding: 2.5rem 1rem; }
  .ss-tal-title { font-size: 1.6rem; }
}
```

**Step 2 : Vérifier visuellement dans le navigateur**

Ouvrir `/talents`. Vérifier :
- Fond sombre `#0C1E1C`
- Header avec titre amber et stats glass
- Grille 3 colonnes (réduire la fenêtre pour tester 2→1)

**Step 3 : Commit**

```bash
git add public/css/talents.css
git commit -m "style: réécriture CSS talents — Noir Académique"
```

---

### Task 2 : EJS — réécriture complète de `views/pages/talents.ejs`

**Files:**
- Modify: `views/pages/talents.ejs`

**Step 1 : Remplacer tout le contenu de `views/pages/talents.ejs` par le code suivant**

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
    <%- include('../partials/navbar.ejs') %>

    <div class="ss-tal-page">

        <!-- Header -->
        <header class="ss-tal-header">
            <h1 class="ss-tal-title">Tous les <em>talents</em></h1>
            <p class="ss-tal-subtitle">Découvrez les experts de notre communauté</p>
            <div class="ss-tal-stats">
                <div class="ss-tal-stat-box">
                    <span class="ss-tal-stat-num"><%= totalUsers %></span>
                    <span class="ss-tal-stat-label">Talents disponibles</span>
                </div>
                <div class="ss-tal-stat-box">
                    <span class="ss-tal-stat-num"><%= users.reduce((sum, u) => sum + u.skills.length, 0) %></span>
                    <span class="ss-tal-stat-label">Compétences partagées</span>
                </div>
            </div>
        </header>

        <!-- Body -->
        <div class="ss-tal-body">

            <!-- Grid -->
            <div class="ss-tal-grid">
                <% users.forEach((user) => { %>
                    <div class="ss-tal-card">

                        <!-- Avatar -->
                        <div class="ss-tal-avatar">
                            <% if (user.avatar) { %>
                                <img src="<%= user.avatar %>" alt="<%= user.firstname %> <%= user.lastname %>">
                            <% } else { %>
                                <%= user.firstname.charAt(0).toUpperCase() %><%= user.lastname.charAt(0).toUpperCase() %>
                            <% } %>
                        </div>

                        <!-- Name -->
                        <a href="/talents/<%= user.id %>" class="ss-tal-name">
                            <%= user.firstname %> <%= user.lastname %>
                        </a>

                        <!-- Stars -->
                        <div class="ss-tal-stars">
                            <div class="ss-tal-stars-row">
                                <% const fullStars = Math.floor(user.averageRating || 0); %>
                                <% const hasHalf = (user.averageRating || 0) % 1 >= 0.5; %>
                                <% for (let i = 0; i < fullStars; i++) { %>
                                    <i class="fas fa-star filled"></i>
                                <% } %>
                                <% if (hasHalf) { %>
                                    <i class="fas fa-star-half-alt filled"></i>
                                <% } %>
                                <% for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) { %>
                                    <i class="far fa-star"></i>
                                <% } %>
                            </div>
                            <span class="ss-tal-rating">(<%= (user.averageRating || 0).toFixed(1) %>/5)</span>
                        </div>

                        <!-- Skills -->
                        <div class="ss-tal-skills">
                            <% user.skills.forEach(skill => { %>
                                <a href="/skills/<%= skill.slug %>" class="ss-tal-pill">
                                    <%= skill.label %>
                                </a>
                            <% }) %>
                        </div>

                        <!-- Actions -->
                        <div class="ss-tal-actions">
                            <% const isFollowing = followedUser && followedUser.followed && followedUser.followed.some(f => f.id === user.id); %>
                            <button
                                class="ss-tal-follow btn-follow <%= isFollowing ? 'is-following' : '' %>"
                                data-user-id="<%= user.id %>"
                                data-following="<%= isFollowing ? 'true' : 'false' %>"
                            >
                                <i class="fas <%= isFollowing ? 'fa-user-minus' : 'fa-user-plus' %>"></i>
                                <span><%= isFollowing ? 'Ne plus suivre' : 'Suivre' %></span>
                            </button>
                            <a href="/messages/<%= user.id %>" class="ss-tal-message">
                                <i class="fas fa-paper-plane"></i>
                                <span>Message</span>
                            </a>
                        </div>

                    </div>
                <% }) %>
            </div>

            <!-- Pagination -->
            <% if (totalPages > 1) { %>
            <nav class="ss-tal-pagination" aria-label="pagination">
                <% if (currentPage > 1) { %>
                    <a class="ss-tal-page-link" href="/talents?page=<%= currentPage - 1 %>">← Précédent</a>
                <% } else { %>
                    <a class="ss-tal-page-link" disabled>← Précédent</a>
                <% } %>

                <% for (let i = 1; i <= totalPages; i++) { %>
                    <a class="ss-tal-page-link <%= i === currentPage ? 'is-current' : '' %>"
                       href="/talents?page=<%= i %>"
                       aria-label="Page <%= i %>">
                        <%= i %>
                    </a>
                <% } %>

                <% if (currentPage < totalPages) { %>
                    <a class="ss-tal-page-link" href="/talents?page=<%= currentPage + 1 %>">Suivant →</a>
                <% } else { %>
                    <a class="ss-tal-page-link" disabled>Suivant →</a>
                <% } %>
            </nav>
            <% } %>

        </div><!-- /.ss-tal-body -->

    </div><!-- /.ss-tal-page -->

    <script src="/js/follow.js"></script>
    <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Vérifier dans le navigateur**

Ouvrir `/talents`. Vérifier :
- Les cartes affichent avatar (initiales ou photo), nom (lien), étoiles, pills, boutons
- Le bouton "Suivre" fonctionne (AJAX, pas de rechargement de page)
- Le lien "Message" redirige vers `/messages/:id`
- La pagination s'affiche si plusieurs pages
- Aucune classe Bulma visible dans le HTML généré

**Step 3 : Commit**

```bash
git add views/pages/talents.ejs
git commit -m "feat: réécriture EJS talents — Noir Académique, suppression Bulma"
```

---

### Task 3 : Vérification finale

**Step 1 : Test responsive**

Redimensionner le navigateur :
- `> 900px` → 3 colonnes
- `600–900px` → 2 colonnes
- `< 600px` → 1 colonne

**Step 2 : Test follow/unfollow**

Connecté en tant qu'utilisateur, cliquer "Suivre" sur une carte → le bouton doit se transformer en "Ne plus suivre" sans rechargement. Cliquer à nouveau → retour à "Suivre".

**Step 3 : Vérifier console navigateur**

Ouvrir les DevTools → onglet Console. Aucune erreur JS attendue.

**Step 4 : Commit final si non fait**

```bash
git status
# Si propre, rien à faire.
```
