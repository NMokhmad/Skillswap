# Design — Migration Noir Académique · talent / skill / notifications / messages

**Date :** 2026-02-25
**Branche :** migration
**Scope :** 4 pages EJS + 4 fichiers CSS + 1 mise à jour style.md

---

## Objectif

Appliquer l'esthétique « Noir Académique » (style.md) à :
- `views/pages/talent.ejs` + `public/css/talent.css`
- `views/pages/skill.ejs` + `public/css/skill.css`
- `views/pages/notifications.ejs` + `public/css/notifications.css`
- `views/pages/messages.ejs` + section `msg-` de `public/css/messages.css`

Supprimer toutes les dépendances Bulma. Adopter la nomenclature `ss-` pour les nouvelles classes.

---

## Nomenclature — ajouts à style.md

| Page | Préfixe |
|---|---|
| Talent (profil) | `ss-tp-` |
| Compétence (détail) | `ss-sp-` |
| Notifications | `ss-notif-` |
| Messages | `ss-msg-` |

---

## Page `talent.ejs` — profil public d'un talent

### Layout
Remplace `columns is-8/is-4` par :
```css
display: grid;
grid-template-columns: 1fr 340px;
gap: 1.5rem;
```
≤ 900px → 1 colonne (`grid-template-columns: 1fr`).

### Header profil `.ss-tp-header`
- Carte glass (patron commun)
- Avatar `.ss-tp-avatar` : 128px, fond `rgba(212, 146, 42, 0.20)`, bordure `rgba(212, 146, 42, 0.30)`
- Badge "Vérifié" `.ss-tp-verified` : pill amber plein
- Titre nom `.ss-tp-name` : Cormorant Garamond, cream
- Étoiles `.ss-tp-stars` : amber (filled), cream 0.20 (vide)
- Note `.ss-tp-rating` : cream-muted
- Boutons : "Suivre" outline amber / "Message" amber plein (pattern buttons)

### Sections (bio, compétences, contact)
- Titre `.ss-tp-section-title` : Outfit 1.1rem 600, cream + icône amber
- Séparateur `hr` : amber 0.15
- Skills : pills `ss-tp-pill` (identique à `ss-tal-pill`)
- Contact box `.ss-tp-contact` : carte glass, icône amber, email amber

### Section Avis
- Header : titre Outfit + bouton amber "Laisser un avis"
- Formulaire `.ss-tp-review-form` : carte glass, labels cream-muted, champs glass, étoiles amber
- Cartes avis `.ss-tp-review-card` : carte glass uniforme (exit alternance rose/bleu/violet)
- Avatar reviewer : cercle amber 0.20
- Étoiles affichage : amber filled / cream 0.20 vide
- Contenu texte : cream-muted

### Sidebar `.ss-tp-sidebar`
- Sticky top 20px
- 3 stat-boxes `.ss-tp-stat-box` : carte glass, chiffre Cormorant amber, label uppercase
- Badge membre `.ss-tp-member-badge` : carte glass, icône award amber, date cream-muted

---

## Page `skill.ejs` — détail d'une compétence

### Header compétence `.ss-sp-header`
- Carte glass (pas de gradient violet)
- Icône FA dans cercle `.ss-sp-icon-wrap` : 80px, fond amber 0.15, bordure amber 0.30, icône amber
- Hover icône : fond amber plein
- Titre `.ss-sp-title` : Cormorant Garamond italic 600, amber
- Counter badge `.ss-sp-counter` : carte glass inline, icône amber, texte cream
- Tags `.ss-sp-tag` : pills amber (exit pulsation CSS)

### Section talents `.ss-sp-section-title`
- Titre Outfit + icône amber
- Grille `.ss-sp-grid` : `repeat(4, 1fr)` → `repeat(2, 1fr)` → `1fr`

### Cartes talent `.ss-sp-card`
- Patron carte glass uniforme (exit alternance 6 couleurs)
- Avatar : cercle amber 0.20, icône `fa-user` amber
- Nom `.ss-sp-name` : Outfit 600, cream → amber au hover
- Supprimer : note "4.5", stats "42/89%", badge "Expert", badges "Top 1/2/3"

### Empty state `.ss-sp-empty`
- Carte glass avec bordure dashed amber 0.30
- Icône amber (opacity 0.3)
- Bouton "Voir toutes les compétences" : outline amber
- Bouton "M'alerter" : supprimé (non fonctionnel)
- Suggestions : liste glass, icônes amber

### Bouton retour
- `.ss-sp-back-btn` : secondaire outline amber

---

## Page `notifications.ejs`

### Structure
- Fond `#0C1E1C`
- Conteneur centré `max-width: 720px`
- Suppression `columns is-centered`, `column is-8-desktop`

### Header `.ss-notif-header`
- Flex entre titre + bouton "Tout marquer"
- Titre `.ss-notif-title` : Cormorant Garamond italic amber
- Sous-titre `.ss-notif-subtitle` : cream-muted
- Bouton "Tout marquer" `.ss-notif-mark-all` : outline amber

### Items `.ss-notif-item`
- Carte glass, border amber 0.18
- Non lu `.ss-notif-item--unread` : border amber 0.35, fond `rgba(212, 146, 42, 0.05)`
- Icônes par type `.ss-notif-icon-[type]` : cercles amber uniforme (exit gradients rose/bleu)
- Texte `.ss-notif-text` : cream
- Heure `.ss-notif-time` : cream-muted, icône clock amber

### Boutons d'action
- "Marquer lu" `.ss-notif-read-btn` : outline amber petit
- "Voir" `.ss-notif-view-btn` : amber plein petit
- "Supprimer" `.ss-notif-delete-btn` : transparent → fond `rgba(220, 80, 80, 0.55)` au hover

### Pagination
- Pattern `ss-tal-page-link` (border amber, hover amber plein)

### Empty state `.ss-notif-empty`
- Icône cloche barrée amber
- Texte cream-muted

---

## Page `messages.ejs`

### Structure
- Fond `#0C1E1C`
- Conteneur centré `max-width: 700px`
- Suppression `columns is-centered`, `column is-8`

### Header `.ss-msg-header`
- Icône enveloppe amber (3rem)
- Titre `.ss-msg-title` : Cormorant Garamond italic amber
- Sous-titre `.ss-msg-subtitle` : cream-muted (nb de conversations)

### Cartes conversations `.ss-msg-conv-card`
- Patron carte glass uniforme (exit 4 variantes couleurs)
- Avatar `.ss-msg-avatar` : 56px, fond amber 0.20, bordure amber 0.30
- Nom `.ss-msg-name` : cream, Outfit 600
- Date `.ss-msg-date` : cream-dim
- Aperçu `.ss-msg-preview` : cream-muted, ellipsis
- Badge non-lu `.ss-msg-unread-badge` : amber plein, texte #0C1E1C

### Empty state `.ss-msg-empty`
- Icône `fa-comments` amber
- Titre cream, texte cream-muted
- Bouton "Voir les talents" : amber plein

---

## Fichiers modifiés

| Fichier | Nature |
|---|---|
| `style.md` | +4 lignes préfixes |
| `public/css/talent.css` | Réécriture complète |
| `views/pages/talent.ejs` | Réécriture complète |
| `public/css/skill.css` | Réécriture complète |
| `views/pages/skill.ejs` | Réécriture complète |
| `public/css/notifications.css` | Réécriture complète |
| `views/pages/notifications.ejs` | Réécriture complète |
| `public/css/messages.css` | Réécriture section `msg-` (garder section `conv-`) |
| `views/pages/messages.ejs` | Réécriture complète |

---

## Contraintes

- Pas de Bulma dans le HTML ni dans le CSS
- `talent.ejs` charge FA depuis CDN (`https://kit.fontawesome.com/...`) → supprimer, FA est déjà dans le header partial
- `messages.ejs` charge FA depuis CDN → supprimer
- `messages.css` contient aussi les styles `conv-` (conversation.ejs) → **ne pas supprimer** les règles `conv-` lors de la migration
- JS inline des pages (`review.js`, scripts `nonce`) : structure conservée, seuls les sélecteurs CSS changent
- `review.js` utilise `.review-star`, `.review-stars` → les nouveaux sélecteurs seront `ss-tp-review-star`, `ss-tp-review-stars`
