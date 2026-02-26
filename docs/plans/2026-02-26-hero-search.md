# Hero Search Bar Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ajouter une barre de recherche de talents avec autocomplete dans le hero de la homepage, pointant vers `/search`.

**Architecture:** Widget autonome — HTML dans `homepage.ejs`, styles dans `homepage.css`, JS inline (~50 lignes) avec debounce + dropdown. Réutilise l'API `/api/search/autocomplete` existante sans toucher à `search.js`. DOM construit avec `textContent` uniquement (pas de innerHTML sur données externes).

**Tech Stack:** EJS, CSS (Noir Académique tokens), JS vanilla, API `/api/search/autocomplete?q=`

---

### Task 1 : Styles CSS du widget

**Files:**
- Modify: `public/css/homepage.css` — ajouter après le bloc `.ss-hero-actions` (ligne ~179), avant `/* BUTTON SYSTEM */`

**Step 1 : Ajouter les styles**

```css
/* ─── Hero Search ─── */
.ss-hero-search {
    width: 100%;
    max-width: 560px;
    margin: 0 auto 3.5rem;
}

.ss-hero-search-wrap {
    position: relative;
    display: flex;
    border: 1px solid rgba(247, 242, 232, 0.14);
    border-radius: 4px;
    background: rgba(247, 242, 232, 0.05);
    transition: border-color 0.22s var(--ease);
}

.ss-hero-search-wrap:focus-within {
    border-color: rgba(212, 146, 42, 0.45);
}

.ss-hero-search-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 0.85rem 1.1rem;
    font-family: var(--font-sans);
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--cream);
    letter-spacing: 0.01em;
}

.ss-hero-search-input::placeholder {
    color: rgba(247, 242, 232, 0.30);
}

.ss-hero-search-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    background: var(--amber);
    color: var(--hero-bg);
    border: none;
    cursor: pointer;
    padding: 0 1.3rem;
    font-family: var(--font-sans);
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    white-space: nowrap;
    transition: background 0.22s var(--ease);
    flex-shrink: 0;
}

.ss-hero-search-btn:hover {
    background: var(--amber-light);
}

.ss-hero-search-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    background: #0C1E1C;
    border: 1px solid rgba(212, 146, 42, 0.22);
    border-radius: 4px;
    overflow: hidden;
    z-index: 50;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
}

.ss-hero-search-item {
    width: 100%;
    background: transparent;
    border: none;
    border-top: 1px solid rgba(247, 242, 232, 0.05);
    text-align: left;
    padding: 0.75rem 1.1rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    transition: background 0.15s;
}

.ss-hero-search-item:first-child {
    border-top: none;
}

.ss-hero-search-item:hover,
.ss-hero-search-item.is-active {
    background: rgba(212, 146, 42, 0.10);
}

.ss-hero-search-name {
    font-size: 0.88rem;
    font-weight: 500;
    color: var(--cream);
}

.ss-hero-search-city {
    font-size: 0.75rem;
    color: rgba(247, 242, 232, 0.42);
}

@media (max-width: 480px) {
    .ss-hero-search-btn span {
        display: none;
    }
    .ss-hero-search-btn {
        padding: 0 1rem;
    }
}
```

**Step 2 : Vérifier**

Recharger la homepage — aucun changement visible (HTML pas encore ajouté). Aucune erreur CSS dans la console.

**Step 3 : Commit**

```bash
git add public/css/homepage.css
git commit -m "feat(homepage): add hero search widget CSS"
```

---

### Task 2 : HTML du widget dans le hero

**Files:**
- Modify: `views/pages/homepage.ejs` — insérer après la fermeture de `<div class="ss-hero-actions">`

**Step 1 : Localiser l'emplacement**

Repérer ce bloc dans `homepage.ejs` :

```html
            <div class="ss-hero-actions">
                <a href="/skills" class="ss-btn ss-btn--primary">
                    Explorer les compétences
                </a>
                <a href="/talents" class="ss-btn ss-btn--ghost">
                    <i class="fa-solid fa-users"></i>
                    Découvrir les talents
                </a>
            </div>
```

**Step 2 : Insérer après la fermeture de `</div>` de `.ss-hero-actions`**

```html
            <!-- Hero search -->
            <div class="ss-hero-search">
                <div class="ss-hero-search-wrap">
                    <input
                        id="heroSearchInput"
                        type="text"
                        class="ss-hero-search-input"
                        placeholder="Rechercher un talent par nom..."
                        autocomplete="off"
                        aria-label="Rechercher un talent"
                        aria-controls="heroSearchDropdown"
                        aria-autocomplete="list"
                    >
                    <button id="heroSearchBtn" class="ss-hero-search-btn" type="button" aria-label="Lancer la recherche">
                        <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                        <span>Rechercher</span>
                    </button>
                    <div id="heroSearchDropdown" class="ss-hero-search-dropdown" role="listbox" hidden></div>
                </div>
            </div>
```

**Step 3 : Vérifier**

Recharger la homepage — la barre apparaît sous les deux CTAs, centrée. Aucun décalage de layout.

**Step 4 : Commit**

```bash
git add views/pages/homepage.ejs
git commit -m "feat(homepage): add hero search bar HTML"
```

---

### Task 3 : JS inline — autocomplete + navigation

**Files:**
- Modify: `views/pages/homepage.ejs` — ajouter un `<script nonce>` juste avant `<%- include('../partials/footer.ejs') %>`

**Note sécurité :** Toutes les données utilisateur sont insérées via `textContent` (jamais `innerHTML`). Les données API (fullname, city) sont traitées comme non fiables.

**Step 1 : Vérifier la structure de réponse de l'API**

Ouvrir `app/helpers/apiResponse.js` et confirmer que `sendApiSuccess(res, payload)` retourne `{ success: true, data: payload }`. La réponse de `/api/search/autocomplete` est donc `{ data: { suggestions: [{id, fullname, city}] } }`.

**Step 2 : Ajouter le script**

```html
<script nonce="<%= cspNonce %>">
(function () {
    var input    = document.getElementById('heroSearchInput');
    var btn      = document.getElementById('heroSearchBtn');
    var dropdown = document.getElementById('heroSearchDropdown');

    if (!input) return;

    var debounceTimer = null;
    var activeIndex   = -1;
    var suggestions   = [];

    function navigate(q) {
        var trimmed = (typeof q === 'string' ? q : input.value).trim();
        if (!trimmed) return;
        window.location.href = '/search?q=' + encodeURIComponent(trimmed);
    }

    function closeDropdown() {
        dropdown.hidden = true;
        activeIndex = -1;
        suggestions = [];
    }

    function buildItem(item) {
        var el = document.createElement('button');
        el.type = 'button';
        el.className = 'ss-hero-search-item';
        el.setAttribute('role', 'option');

        var nameEl = document.createElement('span');
        nameEl.className = 'ss-hero-search-name';
        nameEl.textContent = item.fullname;
        el.appendChild(nameEl);

        if (item.city) {
            var cityEl = document.createElement('span');
            cityEl.className = 'ss-hero-search-city';
            cityEl.textContent = item.city;
            el.appendChild(cityEl);
        }

        el.addEventListener('click', function () { navigate(item.fullname); });
        return el;
    }

    function renderSuggestions(items) {
        suggestions = items;
        activeIndex = -1;
        dropdown.innerHTML = '';

        if (!items.length) { closeDropdown(); return; }

        items.forEach(function (item) {
            dropdown.appendChild(buildItem(item));
        });

        dropdown.hidden = false;
    }

    function fetchSuggestions(q) {
        fetch('/api/search/autocomplete?q=' + encodeURIComponent(q))
            .then(function (r) { return r.json(); })
            .then(function (body) {
                var items = (body && body.data && body.data.suggestions) || [];
                renderSuggestions(items);
            })
            .catch(function () { closeDropdown(); });
    }

    function setActive(index) {
        var items = dropdown.querySelectorAll('.ss-hero-search-item');
        items.forEach(function (el) { el.classList.remove('is-active'); });
        if (index >= 0 && index < items.length) {
            items[index].classList.add('is-active');
            activeIndex = index;
        } else {
            activeIndex = -1;
        }
    }

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        var q = input.value.trim();
        if (q.length < 2) { closeDropdown(); return; }
        debounceTimer = setTimeout(function () { fetchSuggestions(q); }, 250);
    });

    input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive(Math.min(activeIndex + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive(Math.max(activeIndex - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
                navigate(suggestions[activeIndex].fullname);
            } else {
                navigate();
            }
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    btn.addEventListener('click', function () { navigate(); });

    document.addEventListener('click', function (e) {
        var wrap = input.closest('.ss-hero-search-wrap');
        if (wrap && !wrap.contains(e.target)) {
            closeDropdown();
        }
    });
}());
</script>
```

**Step 3 : Tester manuellement**

1. Ouvrir la homepage
2. Taper 2+ caractères → suggestions apparaissent dans le dropdown
3. Naviguer avec ↑ ↓ → suggestion active surlignée en amber
4. Enter sur une suggestion → redirige vers `/search?q=<fullname>`
5. Enter sans sélection → redirige avec le texte brut de l'input
6. Cliquer une suggestion → même redirection
7. Appuyer Escape → dropdown se ferme
8. Cliquer hors du widget → dropdown se ferme
9. Bouton "Rechercher" avec texte → redirige
10. Bouton "Rechercher" sans texte → rien
11. Vérifier : aucune erreur CSP dans la console (nonce bien appliqué)

**Step 4 : Commit**

```bash
git add views/pages/homepage.ejs
git commit -m "feat(homepage): hero search autocomplete JS — XSS-safe DOM build"
```

---

### Task 4 : Vérification finale et responsive

**Step 1 : Test mobile (DevTools → 375px)**

Le label "Rechercher" disparaît, seule l'icône loupe reste. La barre reste utilisable.

**Step 2 : Vérifier focus outline**

Cliquer dans l'input → bordure amber apparaît grâce à `:focus-within`.

**Step 3 : Vérifier qu'aucune régression sur `/search`**

Ouvrir `/search` → autocomplete, filtres et pagination fonctionnent normalement.

**Step 4 : Commit si ajustements mineurs**

```bash
git add -p
git commit -m "fix(homepage): hero search polish"
```
