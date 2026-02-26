# Search Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refondre `search.ejs`, `search.css` et mettre à jour les classes dans `search.js` pour aligner la page Recherche sur l'esthétique "Noir Académique".

**Architecture:** Layout 2 colonnes (sidebar 280px + main) avec mini-hero compact. `search.js` conservé intégralement — seules les chaînes de classes CSS sont mises à jour. La connexion homepage vers `/search?q=...` est déjà fonctionnelle, aucune modification de `homepage.ejs`.

**Tech Stack:** EJS, CSS pur (Grid, Flexbox, Custom Properties), JS vanilla (search.js existant)

---

### Task 1: Réécriture de `public/css/search.css`

**Files:**
- Modify: `public/css/search.css` (réécriture complète)

**Step 1: Remplacer le contenu de `public/css/search.css`**

Copier exactement ce contenu dans le fichier :

```css
/* ==========================================
   search.css — Page Recherche "Noir Académique"
   ========================================== */

:root {
  --sr-bg:      #0C1E1C;
  --sr-card:    rgba(14, 34, 32, 0.72);
  --sr-border:  rgba(212, 146, 42, 0.18);
  --sr-amber:   #D4922A;
  --sr-amber-h: #E8A63C;
  --sr-cream:   #F7F2E8;
}

/* PAGE */
.ss-sr-page {
  background: var(--sr-bg);
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
}

/* MINI-HERO */
.ss-sr-hero {
  background: rgba(14, 34, 32, 0.60);
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  padding: 2.5rem 1.5rem;
  text-align: center;
}

.ss-sr-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 600;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  color: var(--sr-amber);
  margin: 0 0 0.3rem;
}

.ss-sr-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: rgba(247, 242, 232, 0.65);
  margin: 0;
}

.ss-sr-hero-wrap {
  display: flex;
  gap: 0.5rem;
  max-width: 600px;
  margin: 1.25rem auto 0;
  position: relative;
}

.ss-sr-query-input {
  flex: 1;
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 8px;
  color: var(--sr-cream);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  padding: 0.65rem 0.9rem;
  transition: border-color 0.2s ease;
}

.ss-sr-query-input::placeholder {
  color: rgba(247, 242, 232, 0.40);
}

.ss-sr-query-input:focus {
  outline: none;
  border-color: rgba(212, 146, 42, 0.55);
}

.ss-sr-hero-btn {
  background: var(--sr-amber);
  color: #0C1E1C;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  padding: 0.65rem 1.25rem;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ss-sr-hero-btn:hover {
  background: var(--sr-amber-h);
  transform: translateY(-1px);
}

/* AUTOCOMPLETE */
.ss-sr-autocomplete {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: rgba(10, 26, 24, 0.97);
  border: 1px solid rgba(212, 146, 42, 0.25);
  border-radius: 10px;
  backdrop-filter: blur(16px);
  z-index: 30;
  overflow: hidden;
}

.ss-sr-autocomplete-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  padding: 0.7rem 1rem;
  color: var(--sr-cream);
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.ss-sr-autocomplete-item:hover,
.ss-sr-autocomplete-item.is-active {
  background: rgba(212, 146, 42, 0.15);
}

/* BODY + LAYOUT */
.ss-sr-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 3rem;
}

.ss-sr-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.5rem;
  align-items: start;
}

/* SIDEBAR */
.ss-sr-sidebar-box {
  background: var(--sr-card);
  border: 1px solid var(--sr-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.25rem;
  position: sticky;
  top: 1.5rem;
  margin-bottom: 1rem;
}

.ss-sr-sidebar-title {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 1rem;
  color: var(--sr-amber);
  margin: 0 0 1rem;
}

.ss-sr-field {
  margin-bottom: 0.9rem;
}

.ss-sr-label {
  display: block;
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(247, 242, 232, 0.75);
  margin-bottom: 0.35rem;
}

.ss-sr-select {
  width: 100%;
  background: rgba(14, 34, 32, 0.50);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 8px;
  color: var(--sr-cream);
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  padding: 0.55rem 0.75rem;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.ss-sr-select:focus {
  outline: none;
  border-color: rgba(212, 146, 42, 0.55);
}

.ss-sr-select option {
  background: #0C1E1C;
  color: var(--sr-cream);
}

.ss-sr-range {
  accent-color: var(--sr-amber);
  width: 100%;
  cursor: pointer;
}

.ss-sr-skills-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem;
  max-height: 200px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.ss-sr-skill-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: rgba(247, 242, 232, 0.80);
  cursor: pointer;
}

.ss-sr-checkbox {
  accent-color: var(--sr-amber);
  cursor: pointer;
}

.ss-sr-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.ss-sr-btn-primary {
  background: var(--sr-amber);
  color: #0C1E1C;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ss-sr-btn-primary:hover {
  background: var(--sr-amber-h);
  transform: translateY(-1px);
}

.ss-sr-btn-secondary {
  background: transparent;
  border: 1px solid var(--sr-amber);
  color: var(--sr-amber);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.ss-sr-btn-secondary:hover {
  background: var(--sr-amber);
  color: #0C1E1C;
}

.ss-sr-btn-danger {
  background: transparent;
  border: 1px solid rgba(220, 80, 80, 0.55);
  color: rgba(220, 80, 80, 0.85);
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  padding: 0.45rem 0.8rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ss-sr-btn-danger:hover {
  background: rgba(220, 80, 80, 0.15);
}

.ss-sr-saved-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.ss-sr-saved-item {
  background: rgba(14, 34, 32, 0.40);
  border: 1px solid rgba(212, 146, 42, 0.15);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
}

.ss-sr-saved-name {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: var(--sr-cream);
  margin: 0 0 0.4rem;
}

.ss-sr-saved-actions {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

/* MAIN RESULTS */
.ss-sr-main {
  min-width: 0;
}

.ss-sr-summary {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: rgba(247, 242, 232, 0.65);
  margin-bottom: 1rem;
}

.ss-sr-results-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.ss-sr-result-card {
  background: var(--sr-card);
  border: 1px solid var(--sr-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.ss-sr-result-card:hover {
  transform: translateY(-4px);
  border-color: rgba(212, 146, 42, 0.35);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.ss-sr-result-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.20);
  color: var(--sr-cream);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  font-family: 'Cormorant Garamond', serif;
  flex-shrink: 0;
}

.ss-sr-result-name {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 1.05rem;
  color: var(--sr-cream);
  text-decoration: none;
  transition: color 0.2s ease;
}

.ss-sr-result-name:hover {
  color: var(--sr-amber);
}

.ss-sr-result-city {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: rgba(247, 242, 232, 0.55);
}

.ss-sr-result-rating {
  color: var(--sr-amber);
  font-size: 0.85rem;
}

.ss-sr-result-rating-value {
  font-family: 'Outfit', sans-serif;
  font-size: 0.75rem;
  color: rgba(247, 242, 232, 0.50);
}

.ss-sr-result-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.2rem;
}

.ss-sr-skill-tag {
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.2rem 0.6rem;
  font-size: 0.72rem;
  color: rgba(247, 242, 232, 0.75);
  font-family: 'Outfit', sans-serif;
}

.ss-sr-muted {
  font-family: 'Outfit', sans-serif;
  font-size: 0.82rem;
  color: rgba(247, 242, 232, 0.45);
}

.ss-sr-result-btn {
  display: inline-block;
  background: var(--sr-amber);
  color: #0C1E1C;
  border: none;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 0.45rem 0.85rem;
  text-decoration: none;
  text-align: center;
  margin-top: auto;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ss-sr-result-btn:hover {
  background: var(--sr-amber-h);
  transform: translateY(-1px);
}

.ss-sr-empty {
  grid-column: 1 / -1;
  border: 1px dashed rgba(212, 146, 42, 0.30);
  border-radius: 12px;
  text-align: center;
  padding: 2.5rem 1rem;
  color: rgba(247, 242, 232, 0.50);
  font-family: 'Outfit', sans-serif;
}

.ss-sr-empty p {
  margin: 0.3rem 0;
}

/* PAGINATION */
.ss-sr-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 1.5rem;
}

.ss-sr-page-list {
  display: flex;
  gap: 0.4rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.ss-sr-page-prev,
.ss-sr-page-next,
.ss-sr-page-link {
  background: rgba(14, 34, 32, 0.60);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 8px;
  color: rgba(247, 242, 232, 0.75);
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.ss-sr-page-prev:hover,
.ss-sr-page-next:hover,
.ss-sr-page-link:hover {
  background: rgba(212, 146, 42, 0.15);
  border-color: rgba(212, 146, 42, 0.40);
  color: var(--sr-amber);
}

.ss-sr-page-link.is-current {
  background: var(--sr-amber);
  border-color: var(--sr-amber);
  color: #0C1E1C;
  font-weight: 700;
}

.ss-sr-page-prev[disabled],
.ss-sr-page-next[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .ss-sr-layout {
    grid-template-columns: 1fr;
  }

  .ss-sr-sidebar-box {
    position: static;
  }
}

@media (max-width: 700px) {
  .ss-sr-results-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .ss-sr-hero {
    padding: 1.75rem 1rem;
  }

  .ss-sr-results-grid {
    grid-template-columns: 1fr;
  }
}
```

**Step 2: Commit**

```bash
git add public/css/search.css
git commit -m "feat(search): réécriture CSS — palette Noir Académique ss-sr-*"
```

---

### Task 2: Réécriture de `views/pages/search.ejs`

**Files:**
- Modify: `views/pages/search.ejs` (réécriture complète)

**Step 1: Remplacer le contenu de `views/pages/search.ejs`**

Copier exactement ce contenu dans le fichier :

```html
<%- include('../partials/header.ejs') %>
</head>

<body>
<%- include('../partials/navbar.ejs') %>

<div class="ss-sr-page">

  <!-- Mini-hero -->
  <section class="ss-sr-hero">
    <h1 class="ss-sr-title">Recherche avancée</h1>
    <p class="ss-sr-subtitle">Filtrez les talents par nom, compétences et note.</p>

    <div class="ss-sr-hero-wrap">
      <input
        id="searchQueryInput"
        type="text"
        class="ss-sr-query-input"
        placeholder="Nom ou prénom..."
        value="<%= initialQuery || '' %>"
        autocomplete="off"
        aria-label="Rechercher un talent"
        aria-controls="autocompleteDropdown"
        aria-autocomplete="list"
      >
      <button id="searchHeroBtn" class="ss-sr-hero-btn" type="button" aria-label="Lancer la recherche">
        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
        Rechercher
      </button>
      <div id="autocompleteDropdown" class="ss-sr-autocomplete" hidden></div>
    </div>
  </section>

  <!-- Body -->
  <div class="ss-sr-body">
    <div class="ss-sr-layout">

      <!-- Sidebar -->
      <aside class="ss-sr-sidebar">

        <div class="ss-sr-sidebar-box">
          <h2 class="ss-sr-sidebar-title">Filtres</h2>

          <div class="ss-sr-field">
            <label class="ss-sr-label" for="searchSortSelect">Tri</label>
            <select id="searchSortSelect" class="ss-sr-select">
              <option value="rating_desc">Note décroissante</option>
              <option value="rating_asc">Note croissante</option>
              <option value="newest">Plus récents</option>
              <option value="popular">Populaires</option>
            </select>
          </div>

          <div class="ss-sr-field">
            <label class="ss-sr-label" for="minRatingRange">
              Note minimum&nbsp;: <span id="minRatingValue">0.0</span>
            </label>
            <input
              id="minRatingRange"
              type="range"
              min="0" max="5" step="0.5" value="0"
              class="ss-sr-range"
            >
          </div>

          <div class="ss-sr-field">
            <label class="ss-sr-label">Compétences</label>
            <div id="skillsFilterList" class="ss-sr-skills-list">
              <% skills.forEach((skill) => { %>
                <label class="ss-sr-skill-item">
                  <input type="checkbox" value="<%= skill.id %>" class="ss-sr-checkbox">
                  <span><%= skill.label %></span>
                </label>
              <% }) %>
            </div>
          </div>

          <div class="ss-sr-actions">
            <button id="applyFiltersBtn" class="ss-sr-btn-primary" type="button">Appliquer</button>
            <button id="resetFiltersBtn" class="ss-sr-btn-secondary" type="button">Réinitialiser</button>
          </div>
        </div>

        <% if (user) { %>
        <div class="ss-sr-sidebar-box">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
            <h3 class="ss-sr-sidebar-title" style="margin-bottom:0">Recherches sauvegardées</h3>
            <button id="saveSearchBtn" class="ss-sr-btn-primary" type="button">Sauvegarder</button>
          </div>
          <div id="savedSearchesList" class="ss-sr-saved-list">
            <p class="ss-sr-muted">Chargement...</p>
          </div>
        </div>
        <% } %>

      </aside>

      <!-- Résultats -->
      <main class="ss-sr-main">
        <p id="resultsSummary" class="ss-sr-summary">Chargement...</p>
        <div id="searchResultsGrid" class="ss-sr-results-grid"></div>
        <nav id="searchPagination" class="ss-sr-pagination" hidden></nav>
      </main>

    </div>
  </div>

</div>

<script nonce="<%= cspNonce %>">
  window.SEARCH_CONFIG = {
    initialQuery: <%- JSON.stringify(initialQuery || '') %>,
    isAuthenticated: <%= user ? 'true' : 'false' %>
  };
</script>
<script src="/js/search.js"></script>
<%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2: Commit**

```bash
git add views/pages/search.ejs
git commit -m "feat(search): réécriture EJS — layout ss-sr-*, suppression filtre Ville"
```

---

### Task 3: Mise à jour des classes dans `public/js/search.js`

**Files:**
- Modify: `public/js/search.js`

Quatre types de changements :
1. Sélecteur `.search-skill-checkbox` → `.ss-sr-checkbox` (ligne 16)
2. Suppression du wrapper `div.column` autour de chaque carte + nouvelles classes
3. Ajout d'un handler pour `#searchHeroBtn`
4. Remplacement de toutes les chaînes de classes `search-*` par `ss-sr-*`

**Step 1: Sélecteur des checkboxes (ligne 16)**

Remplacer :
```
const skillsCheckboxes = Array.from(document.querySelectorAll('.search-skill-checkbox'));
```
Par :
```
const skillsCheckboxes = Array.from(document.querySelectorAll('.ss-sr-checkbox'));
```

**Step 2: Référence au bouton hero**

Après la ligne `const savedSearchesList = document.getElementById('savedSearchesList');`, ajouter :
```
  const searchHeroBtn = document.getElementById('searchHeroBtn');
```

**Step 3: Handler du bouton hero dans `bindEvents()`**

Dans `bindEvents()`, après le bloc `resetBtn?.addEventListener(...)`, ajouter :
```
    searchHeroBtn?.addEventListener('click', () => {
      readStateFromUi();
      state.page = 1;
      hideAutocomplete();
      fetchResults();
    });
```

**Step 4: Remplacer la fonction `renderResults` entière**

La fonction actuelle crée un wrapper `div.column.is-12-mobile...` autour de chaque carte.
Dans la nouvelle version, les cartes `article.ss-sr-result-card` sont insérées directement dans le CSS Grid.

NOTE SECURITE : escapeHtml() est déjà utilisé sur toutes les données utilisateur — l'usage de innerHTML est sécurisé.

Remplacer depuis `function renderResults(data) {` jusqu'à la dernière `}` de cette fonction par :

```
  function renderResults(data) {
    const total = Number(data.total || 0);
    const count = data.results.length;
    resultsSummary.textContent = `${total} résultat${total > 1 ? 's' : ''} — page ${data.page}`;

    if (count === 0) {
      resultsGrid.innerHTML = '<div class="ss-sr-empty"><p><strong>Aucun résultat</strong></p><p>Essayez d\'ajuster vos filtres.</p></div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    data.results.forEach((user) => {
      const starsHtml = buildStars(user.averageRating || 0);
      const skillsHtml = (user.skills || [])
        .map((skill) => '<span class="ss-sr-skill-tag">' + escapeHtml(skill.label) + '</span>')
        .join('');

      const initials = ((user.firstname || '').charAt(0) + (user.lastname || '').charAt(0)).toUpperCase();

      const card = document.createElement('article');
      card.className = 'ss-sr-result-card';

      const nameText = escapeHtml(user.firstname) + ' ' + escapeHtml(user.lastname);
      const cityText = escapeHtml(user.city || 'Ville non renseignée');
      const rating = Number(user.averageRating || 0).toFixed(1);
      const reviewCount = Number(user.reviewCount || 0);
      const skillsContent = skillsHtml || '<span class="ss-sr-muted">Aucune compétence</span>';

      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'ss-sr-result-avatar';
      avatarDiv.textContent = initials;

      const nameLink = document.createElement('a');
      nameLink.href = '/talents/' + user.id;
      nameLink.className = 'ss-sr-result-name';
      nameLink.textContent = user.firstname + ' ' + user.lastname;

      const cityP = document.createElement('p');
      cityP.className = 'ss-sr-result-city';
      cityP.textContent = user.city || 'Ville non renseignée';

      const ratingDiv = document.createElement('div');
      ratingDiv.className = 'ss-sr-result-rating';
      ratingDiv.innerHTML = starsHtml;

      const ratingValueP = document.createElement('p');
      ratingValueP.className = 'ss-sr-result-rating-value';
      ratingValueP.textContent = rating + '/5 (' + reviewCount + ' avis)';

      const skillsDiv = document.createElement('div');
      skillsDiv.className = 'ss-sr-result-skills';
      (user.skills || []).forEach((skill) => {
        const tag = document.createElement('span');
        tag.className = 'ss-sr-skill-tag';
        tag.textContent = skill.label;
        skillsDiv.appendChild(tag);
      });
      if (!(user.skills || []).length) {
        const muted = document.createElement('span');
        muted.className = 'ss-sr-muted';
        muted.textContent = 'Aucune compétence';
        skillsDiv.appendChild(muted);
      }

      const btn = document.createElement('a');
      btn.href = '/talents/' + user.id;
      btn.className = 'ss-sr-result-btn';
      btn.textContent = 'Voir profil';

      card.appendChild(avatarDiv);
      card.appendChild(nameLink);
      card.appendChild(cityP);
      card.appendChild(ratingDiv);
      card.appendChild(ratingValueP);
      card.appendChild(skillsDiv);
      card.appendChild(btn);

      fragment.appendChild(card);
    });

    resultsGrid.appendChild(fragment);
  }
```

Note : Cette version utilise `document.createElement` + `textContent` pour toutes les données dynamiques,
ce qui est la méthode la plus sûre contre le XSS (plus besoin d'escapeHtml pour ces éléments).
Seul `ratingDiv.innerHTML = starsHtml` reste — starsHtml est généré par `buildStars()` qui n'utilise
aucune donnée utilisateur (seulement des nombres).

**Step 5: Remplacer la fonction `renderPagination` entière**

Remplacer depuis `function renderPagination(currentPage, totalPages) {` jusqu'à sa dernière `}` par :

```
  function renderPagination(currentPage, totalPages) {
    if (!totalPages || totalPages <= 1) {
      pagination.hidden = true;
      pagination.innerHTML = '';
      return;
    }

    pagination.hidden = false;
    pagination.innerHTML = '';

    const prev = document.createElement('a');
    prev.className = 'ss-sr-page-prev';
    prev.textContent = 'Précédent';
    if (currentPage <= 1) {
      prev.disabled = true;
    } else {
      prev.href = '#';
      prev.addEventListener('click', (event) => {
        event.preventDefault();
        state.page = currentPage - 1;
        fetchResults();
      });
    }

    const next = document.createElement('a');
    next.className = 'ss-sr-page-next';
    next.textContent = 'Suivant';
    if (currentPage >= totalPages) {
      next.disabled = true;
    } else {
      next.href = '#';
      next.addEventListener('click', (event) => {
        event.preventDefault();
        state.page = currentPage + 1;
        fetchResults();
      });
    }

    const list = document.createElement('ul');
    list.className = 'ss-sr-page-list';

    for (let page = 1; page <= totalPages; page += 1) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'ss-sr-page-link' + (page === currentPage ? ' is-current' : '');
      link.textContent = String(page);
      link.href = '#';
      link.addEventListener('click', (event) => {
        event.preventDefault();
        state.page = page;
        fetchResults();
      });
      li.appendChild(link);
      list.appendChild(li);
    }

    pagination.appendChild(prev);
    pagination.appendChild(next);
    pagination.appendChild(list);
  }
```

**Step 6: Mettre à jour `renderAutocomplete()` — classe des items (ligne ~363)**

Remplacer :
```
      option.className = `search-autocomplete-item ${index === autocompleteIndex ? 'is-active' : ''}`;
```
Par :
```
      option.className = 'ss-sr-autocomplete-item' + (index === autocompleteIndex ? ' is-active' : '');
```

**Step 7: Remplacer la fonction `loadSavedSearches` entière**

Remplacer depuis `async function loadSavedSearches() {` jusqu'à sa dernière `}` par :

```
  async function loadSavedSearches() {
    if (!savedSearchesList) return;
    savedSearchesList.textContent = '';
    const loadingP = document.createElement('p');
    loadingP.className = 'ss-sr-muted';
    loadingP.textContent = 'Chargement...';
    savedSearchesList.appendChild(loadingP);

    try {
      const res = await fetch('/api/search/saved');
      if (!res.ok) {
        savedSearchesList.textContent = '';
        const errP = document.createElement('p');
        errP.className = 'ss-sr-muted';
        errP.textContent = 'Impossible de charger.';
        savedSearchesList.appendChild(errP);
        return;
      }

      const data = await res.json();
      const searches = data.searches || [];

      savedSearchesList.textContent = '';

      if (!searches.length) {
        const emptyP = document.createElement('p');
        emptyP.className = 'ss-sr-muted';
        emptyP.textContent = 'Aucune recherche sauvegardée.';
        savedSearchesList.appendChild(emptyP);
        return;
      }

      searches.forEach((saved) => {
        const item = document.createElement('div');
        item.className = 'ss-sr-saved-item';

        const nameP = document.createElement('p');
        nameP.className = 'ss-sr-saved-name';
        nameP.textContent = saved.name;
        item.appendChild(nameP);

        const actions = document.createElement('div');
        actions.className = 'ss-sr-saved-actions';

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'ss-sr-btn-secondary saved-apply-btn';
        applyBtn.textContent = 'Appliquer';
        applyBtn.addEventListener('click', () => { applySavedFilters(saved.filters || {}); });

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'ss-sr-btn-danger saved-delete-btn';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.addEventListener('click', async () => {
          const delRes = await fetch('/api/search/saved/' + saved.id, { method: 'DELETE' });
          if (delRes.ok) { loadSavedSearches(); }
        });

        actions.appendChild(applyBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(actions);
        savedSearchesList.appendChild(item);
      });
    } catch (error) {
      console.error('Erreur loadSavedSearches:', error);
      savedSearchesList.textContent = '';
      const errP = document.createElement('p');
      errP.className = 'ss-sr-muted';
      errP.textContent = 'Impossible de charger.';
      savedSearchesList.appendChild(errP);
    }
  }
```

**Step 8: Vérifier dans le navigateur**

- `/search` : fond sombre, mini-hero amber, layout 2 colonnes, cartes glass
- Taper dans le champ + cliquer "Rechercher" → résultats filtrés
- Autocomplete au-dessus du champ
- Homepage (`/`) : taper dans le hero + Entrée → redirige vers `/search?q=...` avec résultats pré-filtrés
- Filtres "Appliquer" / "Réinitialiser" fonctionnels
- Responsive : sidebar au-dessus sur mobile

**Step 9: Commit**

```bash
git add public/js/search.js
git commit -m "feat(search): JS — classes ss-sr-*, DOM sécurisé createElement, handler searchHeroBtn"
```

---

## Vérification responsive finale

| Breakpoint | Comportement attendu                              |
|------------|---------------------------------------------------|
| > 900px    | Sidebar 280px à gauche, résultats 3 colonnes      |
| < 900px    | Sidebar au-dessus, résultats 3 colonnes           |
| < 700px    | Résultats 2 colonnes                              |
| < 480px    | Résultats 1 colonne, hero padding réduit          |

## Note sur `views/pages/searchPage.ejs`

Ce fichier apparaît en `D` (supprimé) dans `git status`. Si la suppression n'est pas encore committée :
```bash
git add views/pages/searchPage.ejs
git commit -m "chore: suppression searchPage.ejs (remplacé par search.ejs refactorisé)"
```
