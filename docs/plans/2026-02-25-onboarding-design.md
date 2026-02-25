# Design Document — Page Onboarding
Date: 2026-02-25

## Contexte

Refonte de la page d'onboarding (`/onboarding`) pour aligner sur l'esthétique "Noir Académique" établie pour homepage, navbar, footer et register. Suppression complète de Bulma CSS.

## Décisions de design

- **Structure** : Page unique défilable (pas de wizard multi-étapes)
- **Conteneur** : Carte verre identique à register (cohérence maximale)
- **Skills** : Tags pills cliquables (pas de cards avec icônes)
- **Progression** : Supprimée (page unique, pas nécessaire)

## Architecture HTML

```
<body class="ss-ob-body">
  .ss-ob-page  (min-height: 100vh, flex center)
    .ss-ob-card  (glass, max-width: 620px)
      .ss-ob-header
        h1.ss-ob-title  "Bienvenue, <em>Prénom</em> !"
        p.ss-ob-subtitle
      <form POST /onboarding>
        <!-- Section 1 : Avatar -->
        .ss-ob-section
          h2.ss-ob-section-title  "Photo de profil"
          .ss-ob-avatar-zone  (label wrappant l'input file)
            i.fa-camera  (icône par défaut)
            img#avatarPreview  (prévisualisation, hidden par défaut)
          span#avatarFilename  (nom du fichier)
        <hr class="ss-ob-sep">
        <!-- Section 2 : Bio -->
        .ss-ob-section
          h2.ss-ob-section-title  "À propos de vous"
          .ss-ob-textarea-wrap
            textarea[name=bio, maxlength=500]
            span#bioCount  "0/500"
        <hr class="ss-ob-sep">
        <!-- Section 3 : Compétences -->
        .ss-ob-section
          h2.ss-ob-section-title  "Vos compétences *"
          .ss-ob-search-wrap
            input#skillSearch  (filtre live)
            i.fa-search
          .ss-ob-skills-grid  (flex wrap)
            <label class="ss-ob-pill"> (× N skills)
              input[type=checkbox, name=skills[], value=id]
              span  label
          p#skillCount  (hidden, "X sélectionnée(s)")
        <hr class="ss-ob-sep">
        <!-- Section 4 : Nouvelle compétence -->
        .ss-ob-section
          h2.ss-ob-section-title  "Proposer une compétence"
          .ss-ob-input-wrap
            input[name=new_skill, maxlength=50]
            i.fa-lightbulb
        <!-- Actions -->
        .ss-ob-actions
          button[type=submit].ss-ob-btn  "Terminer et explorer"
          a[href=/].ss-ob-skip  "Plus tard"
```

## Palette de couleurs

Réutilise les variables de register.css (les deux CSS partagent la même `:root` de facto) :

| Variable           | Valeur                          | Usage                  |
|--------------------|---------------------------------|------------------------|
| `--ob-bg`          | `#0C1E1C`                       | Fond de page           |
| `--ob-card-bg`     | `rgba(14, 34, 32, 0.72)`        | Fond carte             |
| `--ob-border`      | `rgba(212, 146, 42, 0.18)`      | Bordure carte          |
| `--ob-amber`       | `#D4922A`                       | Accent principal       |
| `--ob-amber-h`     | `#E8A63C`                       | Hover amber            |
| `--ob-cream`       | `#F7F2E8`                       | Texte principal        |
| `--ob-cream-4`     | `rgba(247, 242, 232, 0.42)`     | Texte secondaire       |
| `--ob-error`       | `rgba(220, 80, 80, 0.85)`       | Erreur                 |
| `--font-serif`     | `'Cormorant Garamond', ...`     | Titres                 |
| `--font-sans`      | `'Outfit', ...`                 | Corps                  |

## Composants

### Carte (`.ss-ob-card`)
- `max-width: 620px` (plus large que register pour la grille skills)
- `backdrop-filter: blur(16px) saturate(1.4)`
- `border-radius: 16px`, `padding: 2.5rem`
- Box-shadow : profondeur + glow amber inset

### Titre de section (`.ss-ob-section-title`)
- 0.65rem, uppercase, letter-spacing 0.14em, amber
- Même style que `.ss-reg-label`

### Avatar zone (`.ss-ob-avatar-zone`)
- `<label>` wrappant l'`<input type="file" hidden>`
- Cercle 100px, `border: 2px dashed rgba(212,146,42,0.35)`
- Fond `rgba(212,146,42,0.06)`, border-radius 50%
- Icône `fa-camera` cream 0.4 par défaut
- Au click : ouvre le file picker
- Sur changement : JS affiche `<img#avatarPreview>` en `object-fit: cover`

### Bio textarea (`.ss-ob-textarea`)
- Même style que `.ss-reg-input` (fond, bordure, focus)
- `resize: none`, `rows: 3`, `min-height: 80px`
- Compteur `#bioCount` positionné bottom-right : amber, 0.68rem

### Pills compétences (`.ss-ob-pill`)
- `<label>` wrappant un `<input type="checkbox" hidden>`
- Fond `rgba(247,242,232,0.05)`, bordure `rgba(247,242,232,0.10)`, `border-radius: 100px`
- Padding `0.35rem 0.85rem`, font-size `0.78rem`
- `:has(input:checked)` → fond `rgba(212,146,42,0.15)`, bordure amber, texte cream brightness
- Transition 0.15s ease-out

### Input recherche skills
- Même style `.ss-reg-input` avec icône `fa-search`
- JS : `input` event → filtre les pills par `data-name` (textContent lowercase)
- Pills non-matchées : `display: none`

### Compteur sélection (`#skillCount`)
- `display: none` par défaut
- Affiché quand ≥ 1 skill coché
- Texte : `"N compétence(s) sélectionnée(s)"`, amber, 0.78rem

### Bouton submit (`.ss-ob-btn`)
- Identique à `.ss-reg-btn` (amber plein, hover lift)

### Lien skip (`.ss-ob-skip`)
- Centré sous le bouton
- Texte `Plus tard`, cream 0.36 opacité, lien vers `/`
- Hover : cream 0.65

## JavaScript (inline, noncé)

Logique purement front, 3 fonctions :

1. **Avatar preview** : `change` sur input file → `FileReader` → `img.src` → show img / hide icône
2. **Bio counter** : `input` sur textarea → `bioCount.textContent = val.length + '/500'`
3. **Skills** :
   - `change` sur chaque checkbox → compte les cochés → update `#skillCount` + activer/désactiver submit
   - `input` sur `#skillSearch` → filtre les `.ss-ob-pill` par `data-name`

## Validation

- Frontend : submit bloqué si 0 skills sélectionnés (bouton disabled + message)
- Backend existant inchangé (Multer + controller)

## Responsive

| Breakpoint | Changement                                           |
|------------|------------------------------------------------------|
| `< 640px`  | Carte pleine largeur, padding réduit à 1.5rem        |
| `< 480px`  | Titre réduit à 1.6rem, avatar zone 80px              |
| `< 360px`  | Pills font-size 0.72rem                              |

## Fichiers à modifier

1. `views/pages/onboarding.ejs` — Réécriture complète, classes `ss-ob-*`
2. `public/css/onboarding.css` — Réécriture complète
3. `public/js/onboarding.js` — **Supprimer** (logique JS déplacée inline dans le template, noncée CSP)
