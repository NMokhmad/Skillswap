# Design Document — Page Skills
Date: 2026-02-25

## Contexte

Refonte de la page `/skills` pour aligner sur l'esthétique "Noir Académique". Suppression complète de Bulma CSS, des 6 variantes de couleurs, des étoiles hardcodées (4.5) et des tags "Populaire"/"Tendance" basés sur l'index. Page de listing simple avec icônes FA et compteur de talents réel.

## Décisions de design

- **Layout** : Fond `#0C1E1C` continu, header pleine largeur, grille CSS pure
- **Cartes** : Glass card amber — 1 seule variante de couleur
- **Suppressions** : étoiles hardcodées, tags "Populaire"/"Tendance" faux
- **Badge** : `skill.users.length` (données réelles)
- **CTA bas** : "Proposer une compétence" → lien vers `/login`
- **Recherche** : JS inline avec nonce conservé

## Architecture HTML

```
<body>
  .ss-sk-page
    .ss-sk-header              (pleine largeur)
      h1.ss-sk-title           "Nos <em>compétences</em>"
      p.ss-sk-subtitle
      .ss-sk-stats
        .ss-sk-stat-box × 2    (Compétences / Talents)
    .ss-sk-body                (max-width: 1200px, centré)
      .ss-sk-search-wrap       (barre de recherche)
        i.fa-search
        input#skills-search
      .ss-sk-grid              (CSS Grid 3→2→1)
        a.ss-sk-card-link[href=/skills/:slug] × N
          .ss-sk-card
            .ss-sk-badge       (nb talents, absolu top-right)
            .ss-sk-icon-wrap   (cercle amber)
              i.fas.fa-[icon]
            h2.ss-sk-label
            .ss-sk-cta         ("Voir les talents →", opacity 0→1 hover)
      .ss-sk-bottom-cta        (CTA "Proposer une compétence" → /login)
```

## Palette de couleurs

| Variable       | Valeur                     | Usage           |
|----------------|----------------------------|-----------------|
| `--sk-bg`      | `#0C1E1C`                  | Fond de page    |
| `--sk-card`    | `rgba(14, 34, 32, 0.72)`   | Fond carte      |
| `--sk-border`  | `rgba(212, 146, 42, 0.18)` | Bordure carte   |
| `--sk-amber`   | `#D4922A`                  | Accent          |
| `--sk-amber-h` | `#E8A63C`                  | Hover amber     |
| `--sk-cream`   | `#F7F2E8`                  | Texte principal |

## Composants

### Header (`.ss-sk-header`)
- Identique à `.ss-tal-header` (fond, border-bottom, padding, typo)
- Titre : "Nos <em>compétences</em>" en Cormorant Garamond italic amber
- Stats : 2 pills — `skills.length` compétences + `totalUsers` talents

### Barre de recherche (`.ss-sk-search-wrap`)
- `display: flex; align-items: center; gap: 0.75rem`
- Fond `rgba(14,34,32,0.60)`, bordure amber 0.2, border-radius 10px
- Input : fond transparent, couleur cream, placeholder cream 0.4
- Icône loupe amber à gauche
- JS inline avec `nonce="<%= cspNonce %>"` conservé tel quel

### Grille (`.ss-sk-grid`)
- `display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem`
- `max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem`
- Tablet `< 900px` : 2 colonnes
- Mobile `< 600px` : 1 colonne

### Carte (`.ss-sk-card`)
- Glass identique aux autres pages, `min-height: 200px`
- `display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem`
- `position: relative` (pour le badge absolu)
- Hover : `translateY(-6px)` + amber border 0.35 + léger glow

### Badge (`.ss-sk-badge`)
- Position `absolute; top: 1rem; right: 1rem`
- Pill amber : `background: rgba(212,146,42,0.15)`, border amber 0.3
- Texte : `skill.users.length` + icône `fa-users`, cream, `0.75rem`

### Cercle icône (`.ss-sk-icon-wrap`)
- 80px cercle, `background: rgba(212,146,42,0.15)`
- Bordure `1px solid rgba(212,146,42,0.30)`
- Icône `skill.icon` en amber, `font-size: 2rem`
- Hover carte → cercle amber plein, icône `#0C1E1C`

### Label (`.ss-sk-label`)
- Cormorant Garamond, cream, `1.1rem`, centré
- Pas d'étoiles, pas de tags

### CTA hover (`.ss-sk-cta`)
- "Voir les talents →" texte amber, `0.8rem`
- `opacity: 0; transform: translateY(6px)` → hover carte : `opacity: 1; translateY(0)`
- Transition `0.25s ease`

### CTA bas de page (`.ss-sk-bottom-cta`)
- Bloc centré, `max-width: 500px; margin: 3rem auto`
- Bordure amber pointillée `2px dashed rgba(212,146,42,0.30)`
- Titre Cormorant Garamond amber, sous-titre cream 0.6
- `<a href="/login">` amber plein, border-radius 8px

## Responsive

| Breakpoint | Changement                           |
|------------|--------------------------------------|
| `< 900px`  | Grille 2 colonnes                    |
| `< 600px`  | Grille 1 colonne                     |
| `< 480px`  | Header padding réduit, titre 1.6rem  |

## Fichiers à modifier

1. `views/pages/skills.ejs` — Réécriture complète, classes `ss-sk-*`, suppression Bulma
2. `public/css/skills.css` — Réécriture complète

## JS

Script de recherche inline (`<script nonce="<%= cspNonce %>">`) conservé tel quel — cible les `.ss-sk-label` au lieu de `.skill-title`.
