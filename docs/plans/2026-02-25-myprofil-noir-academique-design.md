# Design — myProfil : Migration Noir Académique

**Date :** 2026-02-25
**Branche :** migration
**Approche retenue :** Réécriture complète (EJS + CSS + JS)

---

## Contexte

La page `myProfil` utilise encore Bulma et une palette rose/violet (#e07b91, #6b7db3).
Les pages `skills` et `talents` ont déjà été migrées vers le style « Noir Académique » défini dans `style.md`.
Cette migration aligne `myProfil` sur le même système.

---

## Fichiers modifiés

| Fichier | Nature du changement |
|---|---|
| `views/pages/myProfil.ejs` | Suppression de toutes les classes Bulma, câblage des classes `ss-profil-*` |
| `public/css/myProfil.css` | Réécriture complète Noir Académique |
| `public/js/editProfil.js` | `is-hidden` → `ss-hidden` |
| `public/js/deleteProfil.js` | `is-active` → `ss-profil-modal--active`, sélecteur `.modal-background` → `.ss-profil-modal-backdrop` |
| `public/js/previsualition.js` | Style inline avatar : border `#e8dce8` → `rgba(212,146,42,0.30)` |

---

## Préfixe CSS

`ss-profil-` — à ajouter dans le tableau de nomenclature de `style.md`.

Classe utilitaire partagée : `.ss-hidden { display: none }` définie dans `myProfil.css`.

---

## Structure HTML (myProfil.ejs)

```
<body>
  <%- navbar %>

  <header class="ss-profil-header">
    i.fa-user-gear
    h1.ss-profil-title
    p.ss-profil-subtitle
  </header>

  <main class="ss-profil-main">
    <div class="ss-profil-center">

      <!-- Vue profil -->
      <div id="profil-view" class="ss-profil-card">
        <div class="ss-profil-avatar-section">
          <div class="ss-profil-avatar-wrap">
            img.ss-profil-avatar-img  OU  div.ss-profil-avatar-default
          </div>
          <div class="ss-profil-badge">
        </div>

        <div class="ss-profil-info-list">
          <div class="ss-profil-info-row">   (×4 : prénom, nom, email, bio)
            i.ss-profil-info-icon
            <div class="ss-profil-info-body">
              <span class="ss-profil-info-label">
              <span class="ss-profil-info-value">

          <div class="ss-profil-skills-block">  (conditionnel)
            <p class="ss-profil-skills-title">
            <div class="ss-profil-tags">
              <span class="ss-profil-tag ss-profil-tag--N">

        <div class="ss-profil-actions">
          <button id="editBtn" class="ss-profil-btn-primary">
          <button id="deleteBtn" class="ss-profil-btn-danger">
      </div>

      <!-- Modal suppression -->
      <div id="delete-confirmation" class="ss-profil-modal">
        <div class="ss-profil-modal-backdrop">
        <div class="ss-profil-modal-box">
          i.fa-triangle-exclamation
          h3 / p
          div.ss-profil-warning-box
          div.ss-profil-modal-actions
            form button.ss-profil-btn-delete-confirm
            button#cancelDelete .ss-profil-btn-outline
        <button id="closeModal" class="ss-profil-modal-close">

      <!-- Formulaire édition -->
      <div id="profil-edit" class="ss-profil-edit-card ss-hidden">
        <div class="ss-profil-edit-header">
        <form enctype="multipart/form-data">
          .ss-profil-field  (photo, prénom, nom, email, bio)
          .ss-profil-upload-wrap
          .ss-profil-info-msg
          .ss-profil-form-actions
            button[submit] .ss-profil-btn-primary
            button#cancelEdit .ss-profil-btn-outline

    </div>
  </main>
  <%- footer %>
</body>
```

---

## CSS — Variables

```css
:root {
  --profil-bg:       #0C1E1C;
  --profil-card:     rgba(14, 34, 32, 0.72);
  --profil-border:   rgba(212, 146, 42, 0.18);
  --profil-amber:    #D4922A;
  --profil-amber-h:  #E8A63C;
  --profil-cream:    #F7F2E8;
  --profil-muted:    rgba(247, 242, 232, 0.65);
  --profil-dim:      rgba(247, 242, 232, 0.40);
  --profil-error:    rgba(220, 80, 80, 0.55);
  --profil-error-bg: rgba(220, 80, 80, 0.08);
}
```

## CSS — Composants

| Classe | Style |
|---|---|
| `html, body` | bg `#0C1E1C`, flex column, min-height 100vh |
| `.ss-profil-header` | `rgba(14,34,32,0.60)`, border-bottom amber 0.15, padding 4rem |
| `.ss-profil-title` | Cormorant Garamond italic 600, `clamp(2rem,5vw,3rem)`, amber |
| `.ss-profil-subtitle` | Outfit 1rem, cream-muted |
| `.ss-profil-card` | glass card pattern (identique skills/talents), radius 14px, backdrop-filter blur(16px) |
| `.ss-profil-avatar-wrap` | cercle 128px, border amber 0.30, fond amber 0.10 |
| `.ss-profil-badge` | pill amber (border 0.30, texte amber) |
| `.ss-profil-info-row` | flex gap 1rem, séparateur border-top amber 0.12 |
| `.ss-profil-info-icon` | amber, 1.1rem |
| `.ss-profil-info-label` | Outfit 0.78rem uppercase letter-spacing, cream-dim |
| `.ss-profil-info-value` | Outfit 1rem, cream |
| `.ss-profil-tag` | pill amber border 0.30, cream 0.75 ; hover → fond amber, texte `#0C1E1C` |
| `.ss-profil-btn-primary` | amber plein → hover amber-h + translateY(-1px) |
| `.ss-profil-btn-danger` | outline error → hover fond rouge, texte cream |
| `.ss-profil-btn-outline` | outline amber → hover fond amber, texte `#0C1E1C` |
| `.ss-profil-modal` | `display:none` |
| `.ss-profil-modal--active` | `display:flex`, backdrop `rgba(0,0,0,0.6)` |
| `.ss-profil-modal-box` | glass card, border error teinté |
| `.ss-profil-warning-box` | fond `--profil-error-bg`, border `--profil-error` |
| `.ss-profil-input / textarea` | dark glass `rgba(14,34,32,0.50)`, border amber 0.20, focus border amber 0.55 |
| `.ss-profil-upload-wrap` | bouton CTA amber, filename dark glass |
| `.ss-profil-info-msg` | fond glass amber très teinté |
| `.ss-hidden` | `display: none` |

## CSS — Responsive

```
@media (max-width: 900px)  → .ss-profil-center max-width 680px
@media (max-width: 600px)  → header padding réduit, actions en colonne
@media (max-width: 480px)  → title font-size clamp(1.6rem, 4vw, 2.2rem)
```

---

## JS — Changements

### editProfil.js
- `is-hidden` → `ss-hidden` (add/remove sur `#profil-view` et `#profil-edit`)

### deleteProfil.js
- `is-active` → `ss-profil-modal--active`
- sélecteur `.modal-background` → `.ss-profil-modal-backdrop`

### previsualition.js
- Style inline ligne 23 : `border: 3px solid #e8dce8` → `border: 2px solid rgba(212,146,42,0.30)`

---

## Mise à jour style.md

Ajouter dans le tableau de nomenclature :

| Page       | Préfixe        |
|------------|----------------|
| Mon Profil | `ss-profil-`   |
