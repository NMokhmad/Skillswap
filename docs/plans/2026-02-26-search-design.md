# Design Document — Page Recherche
Date: 2026-02-26

## Contexte

Refonte de `views/pages/search.ejs` et `public/css/search.css` pour aligner sur l'esthétique "Noir Académique". La connexion hero → search (`/search?q=...`) est **déjà fonctionnelle** dans `homepage.ejs`. `search.js` est conservé mais ses classes CSS générées (Bulma) sont mises à jour vers `ss-sr-*`.

## Décisions de design

- **Layout** : Fond `#0C1E1C`, mini-hero compact, 2 colonnes (sidebar 280px + résultats)
- **Mini-hero** : conservé pour permettre la modification de la query
- **Filtre Ville** : supprimé (champ `searchCityInput` retiré du HTML)
- **Filtres conservés** : Tri, Note minimum, Compétences, Recherches sauvegardées (auth)
- **`search.js`** : logique conservée, classes CSS mises à jour vers `ss-sr-*`
- **Connexion homepage** : aucune modification nécessaire (déjà fonctionnelle)

## Architecture HTML

```
body
  .ss-sr-page
    .ss-sr-hero                    (pleine largeur, compact)
      h1.ss-sr-title
      p.ss-sr-subtitle
      .ss-sr-hero-wrap             (input + bouton + dropdown)
        input#searchQueryInput.ss-sr-query-input
        button#searchHeroBtn.ss-sr-hero-btn
        #autocompleteDropdown.ss-sr-autocomplete

    .ss-sr-body                    (max-width: 1200px, centré)
      .ss-sr-layout                (CSS Grid: 280px 1fr)

        aside.ss-sr-sidebar
          .ss-sr-sidebar-box       (Filtres)
            h2.ss-sr-sidebar-title "Filtres"
            .ss-sr-field           (Tri)
              label.ss-sr-label
              select#searchSortSelect.ss-sr-select
            .ss-sr-field           (Note minimum)
              label.ss-sr-label
              input#minRatingRange[type=range].ss-sr-range
            .ss-sr-field           (Compétences)
              label.ss-sr-label
              #skillsFilterList.ss-sr-skills-list
                label.ss-sr-skill-item × N
                  input[type=checkbox].ss-sr-checkbox
                  span
            .ss-sr-actions
              button#applyFiltersBtn.ss-sr-btn-primary   "Appliquer"
              button#resetFiltersBtn.ss-sr-btn-secondary "Réinitialiser"

          .ss-sr-sidebar-box [if user]  (Recherches sauvegardées)
            h3.ss-sr-sidebar-title
            button#saveSearchBtn.ss-sr-btn-primary
            #savedSearchesList.ss-sr-saved-list

        main.ss-sr-main
          p#resultsSummary.ss-sr-summary
          #searchResultsGrid.ss-sr-results-grid   (CSS Grid 3→2→1, alimenté par JS)
          nav#searchPagination.ss-sr-pagination   (alimenté par JS)
```

## Palette de couleurs

| Variable       | Valeur                     | Usage           |
|----------------|----------------------------|-----------------|
| `--sr-bg`      | `#0C1E1C`                  | Fond de page    |
| `--sr-card`    | `rgba(14, 34, 32, 0.72)`   | Fond carte/box  |
| `--sr-border`  | `rgba(212, 146, 42, 0.18)` | Bordure repos   |
| `--sr-amber`   | `#D4922A`                  | Accent          |
| `--sr-amber-h` | `#E8A63C`                  | Hover amber     |
| `--sr-cream`   | `#F7F2E8`                  | Texte principal |

## Composants

### Mini-hero (`.ss-sr-hero`)
- `background: rgba(14, 34, 32, 0.60)`, `border-bottom: 1px solid rgba(212,146,42,0.15)`
- `padding: 2.5rem 1.5rem`, `text-align: center`
- Titre Cormorant Garamond italic amber, `clamp(1.6rem, 3vw, 2.2rem)`
- Sous-titre Outfit cream 0.65, `0.9rem`
- `.ss-sr-hero-wrap` : `display: flex; gap: 0.5rem; max-width: 600px; margin: 1.25rem auto 0; position: relative`
- `input#searchQueryInput` : fond glass, bordure amber 0.2, texte cream, `flex: 1`
- `button#searchHeroBtn` : amber plein, `white-space: nowrap`
- `#autocompleteDropdown.ss-sr-autocomplete` : absolu, glass dark, `z-index: 30`
  - `.ss-sr-autocomplete-item` : `display: flex; justify-content: space-between`, hover amber bg

### Layout (`.ss-sr-layout`)
- `display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start`
- `< 900px` : `grid-template-columns: 1fr` (sidebar au-dessus)

### Sidebar box (`.ss-sr-sidebar-box`)
- Glass card, `padding: 1.25rem`, `border-radius: 14px`
- `position: sticky; top: 1.5rem` (desktop uniquement)
- Titre Cormorant Garamond amber italic, `1rem`

### Select (`.ss-sr-select`)
- Fond `rgba(14,34,32,0.50)`, bordure amber 0.2, texte cream, `border-radius: 8px`, `width: 100%`
- `appearance: none` + icône chevron CSS `::after`

### Slider (`.ss-sr-range`)
- `accent-color: #D4922A; width: 100%`

### Compétences (`.ss-sr-skills-list`)
- `display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem`
- `max-height: 200px; overflow-y: auto`
- `.ss-sr-skill-item` : `display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: cream`
- `input[type=checkbox]` : `accent-color: #D4922A`

### Boutons sidebar
- `.ss-sr-btn-primary` : amber plein
- `.ss-sr-btn-secondary` : outline amber
- `display: flex; gap: 0.5rem; margin-top: 1rem`

### Résumé résultats (`.ss-sr-summary`)
- Outfit, cream 0.65, `0.85rem`, `margin-bottom: 1rem`

### Grille résultats (`#searchResultsGrid`)
- `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem`
- `< 700px` : 2 colonnes
- `< 480px` : 1 colonne

### Carte résultat (`.ss-sr-result-card`) — générée par `search.js`
- Glass card, `padding: 1.25rem`, `display: flex; flex-direction: column; gap: 0.6rem`
- `.ss-sr-result-avatar` : 56px cercle, fond amber 0.20, initiales cream, `font-size: 1.2rem`
- `.ss-sr-result-name` : lien Cormorant Garamond cream, hover amber
- `.ss-sr-result-rating` : étoiles amber / cream 0.2
- `.ss-sr-result-rating-value` : Outfit cream 0.5, `0.75rem`
- `.ss-sr-result-skills` : flex wrap, pills `ss-sr-skill-tag`
- `.ss-sr-result-btn` : bouton amber plein `0.78rem`, `margin-top: auto`
- Hover carte : `translateY(-4px)` + amber border 0.35

### État vide (`.ss-sr-empty`)
- `grid-column: 1 / -1` (span toute la largeur)
- Bordure amber pointillée, centré, cream 0.5

### Pagination (`.ss-sr-pagination`) — générée par `search.js`
- `display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; padding-top: 1.5rem`
- `.ss-sr-page-link` : même style que `.ss-tal-page-link`

### Recherches sauvegardées (`.ss-sr-saved-item`) — auth only
- Glass léger, `border-radius: 8px`, `padding: 0.6rem`
- `.ss-sr-saved-name` : Outfit cream, `font-size: 0.85rem`
- Boutons "Appliquer" / "Supprimer" en petite taille

## Modifications de `search.js`

Les classes générées dynamiquement sont mises à jour :

| Ancienne classe                              | Nouvelle classe              |
|----------------------------------------------|------------------------------|
| `column is-12-mobile is-6-tablet is-4-desktop` | *(supprimé, les cartes vont directement dans le grid)* |
| `search-result-card`                         | `ss-sr-result-card`          |
| `search-result-avatar`                       | `ss-sr-result-avatar`        |
| `search-result-name`                         | `ss-sr-result-name`          |
| `search-result-city`                         | `ss-sr-result-city`          |
| `search-result-rating`                       | `ss-sr-result-rating`        |
| `search-result-rating-value`                 | `ss-sr-result-rating-value`  |
| `search-result-skills`                       | `ss-sr-result-skills`        |
| `search-result-skill`                        | `ss-sr-skill-tag`            |
| `search-muted-text`                          | `ss-sr-muted`                |
| `button search-btn-primary is-small mt-3`    | `ss-sr-result-btn`           |
| `column is-12` + `search-empty-state`        | `ss-sr-empty`                |
| `pagination-previous/next/link`              | `ss-sr-page-prev/next/link`  |
| `pagination-list`                            | `ss-sr-page-list`            |
| `search-autocomplete-item`                   | `ss-sr-autocomplete-item`    |
| `search-saved-item`                          | `ss-sr-saved-item`           |
| `search-saved-name`                          | `ss-sr-saved-name`           |
| `search-btn-secondary saved-apply-btn`       | `ss-sr-btn-secondary`        |
| `button is-danger is-light saved-delete-btn` | `ss-sr-btn-danger`           |

## Responsive

| Breakpoint | Changement                                      |
|------------|-------------------------------------------------|
| `< 900px`  | `.ss-sr-layout` → 1 colonne (sidebar en haut)   |
| `< 900px`  | `.ss-sr-sidebar-box` → `position: static`       |
| `< 700px`  | Résultats 2 colonnes                            |
| `< 480px`  | Résultats 1 colonne, hero padding réduit        |

## Fichiers à modifier

1. `views/pages/search.ejs` — Réécriture complète, classes `ss-sr-*`, suppression filtre Ville
2. `public/css/search.css` — Réécriture complète
3. `public/js/search.js` — Mise à jour des classes CSS générées dynamiquement

## Fichiers à ne PAS modifier

- `homepage.ejs` — connexion hero → `/search?q=...` déjà fonctionnelle
- `public/js/search.js` logique — conservée intégralement, seules les chaînes de classes changent
