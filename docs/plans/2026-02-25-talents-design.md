# Design Document — Page Talents
Date: 2026-02-25

## Contexte

Refonte de la page `/talents` pour aligner sur l'esthétique "Noir Académique". Suppression complète de Bulma CSS et des 6 variantes de couleurs rose/violet. Page de listing avec grille CSS, cartes glass amber, pagination.

## Décisions de design

- **Layout** : Fond `#0C1E1C` continu, header pleine largeur, grille CSS pure
- **Cartes** : Glass card amber (cohérence avec register/onboarding/login) — 1 seule variante de couleur
- **Avatar** : Photo réelle si `user.avatar` existe, sinon initiales sur fond amber 0.2
- **Boutons** : "Suivre" outline amber + "Message" amber plein — `follow.js` conservé sans modification
- **Variants supprimés** : Les 6 variantes rose/violet/bleu supprimées, remplacées par amber uniforme

## Architecture HTML

```
<body>
  .ss-tal-page
    .ss-tal-header           (pleine largeur)
      h1.ss-tal-title        "Tous les <em>talents</em>"
      p.ss-tal-subtitle
      .ss-tal-stats
        .ss-tal-stat-box × 2  (Talents disponibles / Compétences partagées)
    .ss-tal-body             (max-width: 1200px, centré)
      .ss-tal-grid           (CSS Grid 3→2→1)
        .ss-tal-card × N
          .ss-tal-avatar     (img OU initiales)
          a.ss-tal-name      (lien /talents/:id)
          .ss-tal-stars      (étoiles amber + rating)
          .ss-tal-skills     (pills compétences)
            a.ss-tal-pill × N
          .ss-tal-actions
            button.ss-tal-follow
            a.ss-tal-message
      nav.ss-tal-pagination  (si totalPages > 1)
```

## Palette de couleurs

Identique aux autres pages "Noir Académique" :

| Variable         | Valeur                     | Usage           |
|------------------|----------------------------|-----------------|
| `--tal-bg`       | `#0C1E1C`                  | Fond de page    |
| `--tal-card`     | `rgba(14, 34, 32, 0.72)`   | Fond carte      |
| `--tal-border`   | `rgba(212, 146, 42, 0.18)` | Bordure carte   |
| `--tal-amber`    | `#D4922A`                  | Accent          |
| `--tal-amber-h`  | `#E8A63C`                  | Hover amber     |
| `--tal-cream`    | `#F7F2E8`                  | Texte principal |

## Composants

### Header (`.ss-tal-header`)
- Fond `rgba(14, 34, 32, 0.60)`, bordure basse `1px solid rgba(212,146,42,0.15)`
- Padding `4rem 1.5rem`, `text-align: center`
- Titre en Cormorant Garamond italic, amber
- Stats : 2 pills `rgba(14,34,32,0.72)` avec chiffre amber + label cream

### Grille (`.ss-tal-grid`)
- `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem`
- `max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.5rem`
- Tablet `< 900px` : 2 colonnes
- Mobile `< 600px` : 1 colonne

### Carte (`.ss-tal-card`)
- Glass identique à `.ss-reg-card` : `backdrop-filter: blur(16px) saturate(1.4)`
- `border-radius: 14px`, `border: 1px solid rgba(212,146,42,0.18)`
- `display: flex; flex-direction: column; gap: 1rem; padding: 1.5rem`
- Hover : `translateY(-6px)` + border amber 0.35

### Avatar (`.ss-tal-avatar`)
- 72px cercle
- Si `user.avatar` : `<img>` avec `object-fit: cover`
- Sinon : initiales cream sur fond `rgba(212,146,42,0.20)`

### Étoiles (`.ss-tal-stars`)
- Étoiles pleines/demi : amber `#D4922A`
- Étoiles vides : `rgba(247,242,232,0.20)`
- Rating `(x.x/5)` : cream 0.5, `0.75rem`

### Pills compétences (`.ss-tal-pill`)
- `border: 1px solid rgba(212,146,42,0.30)`, cream text, `border-radius: 20px`
- `font-size: 0.78rem`, `padding: 0.25rem 0.75rem`
- Hover : fond amber plein, texte `#0C1E1C`

### Boutons action (`.ss-tal-follow` / `.ss-tal-message`)
- `.ss-tal-follow` : outline amber (border amber, fond transparent, hover amber plein)
- `.ss-tal-message` : amber plein (identique à `.ss-reg-btn` mais sans width 100%)
- `data-user-id` et `data-following` conservés pour `follow.js`
- La classe `.is-following` sur `.ss-tal-follow` change l'icône et le texte (géré par follow.js)

### Pagination (`.ss-tal-pagination`)
- `display: flex; justify-content: center; gap: 0.5rem; padding: 2rem 0`
- Page courante : pill amber plein
- Autres pages : outline amber 0.3, hover amber plein
- Prev/Next : texte amber

## Responsive

| Breakpoint | Changement                              |
|------------|-----------------------------------------|
| `< 900px`  | Grille 2 colonnes                       |
| `< 600px`  | Grille 1 colonne, padding réduit        |
| `< 480px`  | Header padding réduit, titre 1.6rem     |

## Fichiers à modifier

1. `views/pages/talents.ejs` — Réécriture complète, classes `ss-tal-*`, suppression Bulma
2. `public/css/talents.css` — Réécriture complète

## follow.js

`public/js/follow.js` — **aucune modification**. Le script cherche `.btn-follow` → remplacer par `.ss-tal-follow` dans follow.js ET dans le EJS, ou conserver la classe `.btn-follow` sur le bouton en plus de `.ss-tal-follow`.

> Décision : le bouton garde la classe `.btn-follow` pour follow.js + `.ss-tal-follow` pour le CSS.
