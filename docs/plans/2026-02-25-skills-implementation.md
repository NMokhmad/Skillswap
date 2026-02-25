# Skills Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Réécrire `views/pages/skills.ejs` et `public/css/skills.css` en supprimant Bulma, les étoiles hardcodées, les tags faux, et en appliquant l'esthétique "Noir Académique".

**Architecture:** Page de listing avec header pleine largeur + grille CSS 3 colonnes. Cartes glass amber avec icône FA, compteur de talents (données réelles), CTA hover. CTA bas de page → `/login`. Recherche JS inline avec nonce conservée.

**Tech Stack:** EJS, CSS pur (Grid, Flexbox, Custom Properties), Font Awesome, Cormorant Garamond + Outfit (déjà chargés via header.ejs)

---

### Task 1 : CSS — réécriture complète de `public/css/skills.css`

**Files:**
- Modify: `public/css/skills.css`

**Step 1 : Remplacer tout le contenu de `public/css/skills.css` par le CSS suivant**

```css
/* ===== Page Skills — Noir Académique ===== */
:root {
  --sk-bg:      #0C1E1C;
  --sk-card:    rgba(14, 34, 32, 0.72);
  --sk-border:  rgba(212, 146, 42, 0.18);
  --sk-amber:   #D4922A;
  --sk-amber-h: #E8A63C;
  --sk-cream:   #F7F2E8;
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--sk-bg);
}

footer {
  width: 100%;
  margin-top: auto;
}

.ss-sk-page {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.ss-sk-header {
  background: rgba(14, 34, 32, 0.60);
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  padding: 4rem 1.5rem;
  text-align: center;
}

.ss-sk-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--sk-amber);
  margin: 0 0 0.5rem;
}

.ss-sk-title em { font-style: normal; }

.ss-sk-subtitle {
  font-family: 'Outfit', sans-serif;
  color: rgba(247, 242, 232, 0.65);
  font-size: 1rem;
  margin: 0 0 2rem;
}

.ss-sk-stats {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.ss-sk-stat-box {
  background: var(--sk-card);
  border: 1px solid var(--sk-border);
  border-radius: 12px;
  padding: 0.75rem 1.75rem;
  backdrop-filter: blur(10px);
  text-align: center;
}

.ss-sk-stat-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--sk-amber);
  display: block;
}

.ss-sk-stat-label {
  font-family: 'Outfit', sans-serif;
  font-size: 0.78rem;
  color: rgba(247, 242, 232, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Body ── */
.ss-sk-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
  width: 100%;
  box-sizing: border-box;
}

/* ── Search ── */
.ss-sk-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(14, 34, 32, 0.60);
  border: 1px solid rgba(212, 146, 42, 0.20);
  border-radius: 10px;
  padding: 0.65rem 1rem;
  margin-bottom: 2rem;
}

.ss-sk-search-wrap i {
  color: var(--sk-amber);
  font-size: 0.9rem;
  flex-shrink: 0;
}

.ss-sk-search {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  color: var(--sk-cream);
}

.ss-sk-search::placeholder {
  color: rgba(247, 242, 232, 0.40);
  font-style: italic;
}

/* ── Grid ── */
.ss-sk-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

/* ── Card link ── */
.ss-sk-card-link {
  text-decoration: none;
  display: block;
}

/* ── Card ── */
.ss-sk-card {
  background: var(--sk-card);
  border: 1px solid var(--sk-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
  position: relative;
  min-height: 200px;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.ss-sk-card-link:hover .ss-sk-card {
  transform: translateY(-6px);
  border-color: rgba(212, 146, 42, 0.40);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

/* ── Badge ── */
.ss-sk-badge {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  background: rgba(212, 146, 42, 0.15);
  border: 1px solid rgba(212, 146, 42, 0.30);
  border-radius: 20px;
  padding: 0.2rem 0.6rem;
  font-family: 'Outfit', sans-serif;
  font-size: 0.72rem;
  color: var(--sk-amber);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* ── Icon wrap ── */
.ss-sk-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.15);
  border: 1px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--sk-amber);
  transition: background 0.25s ease, color 0.25s ease;
}

.ss-sk-card-link:hover .ss-sk-icon-wrap {
  background: var(--sk-amber);
  color: #0C1E1C;
}

/* ── Label ── */
.ss-sk-label {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--sk-cream);
  margin: 0;
}

/* ── CTA hover ── */
.ss-sk-cta {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  color: var(--sk-amber);
  opacity: 0;
  transform: translateY(6px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.ss-sk-card-link:hover .ss-sk-cta {
  opacity: 1;
  transform: translateY(0);
}

/* ── Bottom CTA ── */
.ss-sk-bottom-cta {
  max-width: 500px;
  margin: 3rem auto 0;
  text-align: center;
  border: 2px dashed rgba(212, 146, 42, 0.30);
  border-radius: 14px;
  padding: 2.5rem 2rem;
}

.ss-sk-bottom-cta-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 1.3rem;
  font-style: italic;
  color: var(--sk-amber);
  margin: 0 0 0.75rem;
}

.ss-sk-bottom-cta-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  color: rgba(247, 242, 232, 0.60);
  margin: 0 0 1.5rem;
}

.ss-sk-bottom-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.5rem;
  background: var(--sk-amber);
  color: #0C1E1C;
  border-radius: 8px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.ss-sk-bottom-cta-btn:hover {
  background: var(--sk-amber-h);
  transform: translateY(-2px);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .ss-sk-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .ss-sk-grid { grid-template-columns: 1fr; }
  .ss-sk-body { padding: 1.5rem 1rem 3rem; }
}

@media (max-width: 480px) {
  .ss-sk-header { padding: 2.5rem 1rem; }
  .ss-sk-title { font-size: 1.6rem; }
}
```

**Step 2 : Vérifier visuellement dans le navigateur**

Ouvrir `/skills`. Vérifier :
- Fond sombre `#0C1E1C`
- Header amber avec stats glass
- Grille 3 colonnes

**Step 3 : Commit**

```bash
git add public/css/skills.css
git commit -m "style: réécriture CSS skills — Noir Académique"
```

---

### Task 2 : EJS — réécriture complète de `views/pages/skills.ejs`

**Files:**
- Modify: `views/pages/skills.ejs`

**Step 1 : Remplacer tout le contenu de `views/pages/skills.ejs` par le code suivant**

```ejs
<%- include('../partials/header.ejs') %>
</head>

<body>
    <%- include('../partials/navbar.ejs') %>

    <div class="ss-sk-page">

        <!-- Header -->
        <header class="ss-sk-header">
            <h1 class="ss-sk-title">Nos <em>compétences</em></h1>
            <p class="ss-sk-subtitle">Découvrez toutes les compétences disponibles sur SkillSwap</p>
            <div class="ss-sk-stats">
                <div class="ss-sk-stat-box">
                    <span class="ss-sk-stat-num"><%= skills.length %></span>
                    <span class="ss-sk-stat-label">Compétences</span>
                </div>
                <div class="ss-sk-stat-box">
                    <span class="ss-sk-stat-num"><%= totalUsers %></span>
                    <span class="ss-sk-stat-label">Talents</span>
                </div>
            </div>
        </header>

        <!-- Body -->
        <div class="ss-sk-body">

            <!-- Search -->
            <div class="ss-sk-search-wrap">
                <i class="fas fa-search"></i>
                <input
                    class="ss-sk-search"
                    type="text"
                    id="skills-search"
                    placeholder="Rechercher une compétence..."
                    autocomplete="off"
                >
            </div>

            <!-- Grid -->
            <div class="ss-sk-grid">
                <% skills.forEach((skill) => { %>
                    <a href="/skills/<%= skill.slug %>" class="ss-sk-card-link">
                        <div class="ss-sk-card">

                            <!-- Badge -->
                            <div class="ss-sk-badge">
                                <i class="fas fa-users"></i>
                                <span><%= skill.users ? skill.users.length : 0 %></span>
                            </div>

                            <!-- Icon -->
                            <div class="ss-sk-icon-wrap">
                                <i class="fas <%= skill.icon %>"></i>
                            </div>

                            <!-- Label -->
                            <h2 class="ss-sk-label"><%= skill.label %></h2>

                            <!-- CTA -->
                            <span class="ss-sk-cta">Voir les talents →</span>

                        </div>
                    </a>
                <% }) %>
            </div>

            <!-- Bottom CTA -->
            <div class="ss-sk-bottom-cta">
                <p class="ss-sk-bottom-cta-title">Vous ne trouvez pas votre compétence ?</p>
                <p class="ss-sk-bottom-cta-text">Connectez-vous pour proposer de nouvelles compétences à notre catalogue.</p>
                <a href="/login" class="ss-sk-bottom-cta-btn">
                    <i class="fas fa-sign-in-alt"></i>
                    Se connecter
                </a>
            </div>

        </div><!-- /.ss-sk-body -->

    </div><!-- /.ss-sk-page -->

    <script nonce="<%= cspNonce %>">
      const searchInput = document.getElementById('skills-search');
      const cards = document.querySelectorAll('.ss-sk-grid .ss-sk-card-link');

      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        cards.forEach(card => {
          const label = card.querySelector('.ss-sk-label');
          if (label) {
            card.style.display = label.textContent.toLowerCase().includes(query) ? '' : 'none';
          }
        });
      });
    </script>

    <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Vérifier dans le navigateur**

Ouvrir `/skills`. Vérifier :
- Cartes affichent icône FA dans cercle amber, nom, badge avec nombre réel de talents
- Survol d'une carte → cercle devient amber plein, "Voir les talents →" apparaît
- Barre de recherche filtre les cartes en temps réel
- CTA bas de page → clic redirige vers `/login`
- Aucune étoile hardcodée ni tag "Populaire"/"Tendance"
- Aucune classe Bulma dans le HTML généré

**Step 3 : Commit**

```bash
git add views/pages/skills.ejs
git commit -m "feat: réécriture EJS skills — Noir Académique, suppression Bulma + éléments hardcodés"
```

---

### Task 3 : Vérification finale

**Step 1 : Test responsive**

Redimensionner le navigateur :
- `> 900px` → 3 colonnes
- `600–900px` → 2 colonnes
- `< 600px` → 1 colonne

**Step 2 : Test recherche**

Taper dans la barre de recherche → seules les cartes dont le nom correspond restent visibles. Effacer → toutes les cartes réapparaissent.

**Step 3 : Vérifier console navigateur**

Ouvrir les DevTools → onglet Console. Aucune erreur JS attendue.

**Step 4 : Vérifier cohérence visuelle**

Ouvrir `/skills` et `/talents` côte à côte. Les deux pages doivent partager le même fond, la même typographie et le même style de header.
