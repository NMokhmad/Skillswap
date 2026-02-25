# Design Document — Page Login
Date: 2026-02-25

## Contexte

Refonte de la page de connexion (`/login`) pour aligner sur l'esthétique "Noir Académique". Suppression complète de Bulma CSS. La page est plus simple que register : 2 champs seulement.

## Décisions de design

- **Layout** : Carte verre identique à register (cohérence maximale)
- **Largeur** : `max-width: 440px` (plus étroit que register, formulaire court)
- **Séparateur "OU"** : Conservé entre le formulaire et le lien /register
- **Lien "Mot de passe oublié ?"** : Conservé, aligné à droite sous le champ password

## Architecture HTML

```
<body>
  .ss-login-page  (min-height: 100vh, flex center)
    .ss-login-card  (glass card, max-width: 440px)
      .ss-login-header
        h1.ss-login-title  "Bon retour sur <em>Skill</em><strong>Swap</strong>"
        p.ss-login-subtitle
      <hr class="ss-login-divider">
      <!-- Bandeau erreur (conditionnel) -->
      <% if (error) { %>
        .ss-login-error
          i.fa-exclamation-triangle
          span  <%= error %>
      <% } %>
      <form POST /login>
        .ss-login-field  (Email)
        .ss-login-field  (Password)
        .ss-login-forgot
          a[href=/forgot-password]  "Mot de passe oublié ?"
        button[type=submit].ss-login-btn
      .ss-login-or
        span  "OU"
      p.ss-login-register-link
        a[href=/register]
```

## Palette de couleurs

Identique à register.css (mêmes variables `:root`) :

| Variable         | Valeur                       | Usage           |
|------------------|------------------------------|-----------------|
| `--login-bg`     | `#0C1E1C`                    | Fond de page    |
| `--login-card`   | `rgba(14, 34, 32, 0.72)`     | Fond carte      |
| `--login-border` | `rgba(212, 146, 42, 0.18)`   | Bordure carte   |
| `--login-amber`  | `#D4922A`                    | Accent          |
| `--login-amber-h`| `#E8A63C`                    | Hover amber     |
| `--login-cream`  | `#F7F2E8`                    | Texte principal |
| `--login-error`  | `rgba(220, 80, 80, 0.85)`    | Erreur texte    |
| `--login-err-bg` | `rgba(220, 80, 80, 0.10)`    | Erreur fond     |

## Composants

### Carte (`.ss-login-card`)
- `max-width: 440px` (plus étroit que register 500px)
- Identique à `.ss-reg-card` : backdrop-filter, border-radius 16px, box-shadow double

### Erreur globale (`.ss-login-error`)
- Fond `rgba(220, 80, 80, 0.10)`, bordure gauche `3px solid rgba(220,80,80,0.55)`
- Border-radius 8px, padding 0.75rem 1rem
- Icône `fa-exclamation-triangle` rouge + texte du serveur
- Affiché uniquement si `typeof error !== 'undefined' && error`

### Champs (`.ss-login-field`)
- Identiques à `.ss-reg-field` / `.ss-reg-input` / `.ss-reg-label`
- Pas de grille 2 colonnes (champs empilés)

### Lien forgot (`.ss-login-forgot`)
- `text-align: right`, `font-size: 0.72rem`, couleur amber 0.6
- Entre le champ password et le bouton submit
- Hover : amber plein

### Bouton submit (`.ss-login-btn`)
- Identique à `.ss-reg-btn` (amber plein, hover lift)

### Séparateur "OU" (`.ss-login-or`)
- `display: flex; align-items: center; gap: 0.75rem`
- Deux lignes `flex: 1; height: 1px; background: rgba(247,242,232,0.10)`
- Texte "OU" en 0.65rem uppercase letter-spacing cream 0.3

### Lien /register (`.ss-login-register-link`)
- Identique à `.ss-reg-login-link`

## Gestion erreur serveur

Le controller passe `error: 'Email ou mot de passe incorrect'` en cas d'échec.
- Vérification EJS : `<% if (typeof error !== 'undefined' && error) { %>`
- Pas d'erreurs par champ (le login ne retourne qu'un message générique)

## Responsive

| Breakpoint | Changement                                     |
|------------|------------------------------------------------|
| `< 480px`  | Carte pleine largeur, padding réduit à 1.5rem  |
| `< 360px`  | Titre réduit à 1.5rem                          |

## Fichiers à modifier

1. `views/pages/login.ejs` — Réécriture complète, classes `ss-login-*`
2. `public/css/login.css` — Réécriture complète

## Aucun JS nécessaire

Pas de JS inline — le login n'a pas de logique front complexe (pas de barre de force, pas de filtre, pas de preview).
