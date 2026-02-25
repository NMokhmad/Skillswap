# Design — Migration Noir Académique · conversation

**Date :** 2026-02-25
**Branche :** migration
**Scope :** 1 page EJS + section `conv-` CSS + 1 JS + 1 mise à jour style.md

---

## Objectif

Appliquer l'esthétique « Noir Académique » (style.md) à :
- `views/pages/conversation.ejs` + section `conv-` de `public/css/messages.css`
- `public/js/chat.js` (mise à jour des sélecteurs CSS)

Supprimer toutes les dépendances Bulma. Adopter la nomenclature `ss-conv-`.

---

## Nomenclature — ajout à style.md

| Page | Préfixe |
|---|---|
| Conversation | `ss-conv-` |

---

## Structure générale

- Fond `#0C1E1C`
- Conteneur `.ss-conv-container` : `max-width: 700px`, centré, `padding: 2.5rem 1.5rem 4rem`
- Suppression : `section`, `container`, `columns is-centered`, `column is-8`, `box`
- Suppression : FA CDN `<script src="https://kit.fontawesome.com/626daf36fc.js">`

---

## Header `.ss-conv-header`

- Carte glass (patron commun)
- Retour `.ss-conv-back` : flex align-center, icône `fa-arrow-left` amber, texte cream-muted
- Avatar `.ss-conv-avatar` : 48px, fond `rgba(212,146,42,0.20)`, bordure `rgba(212,146,42,0.30)`
- Initiales `.ss-conv-avatar-initials` : Outfit 700, cream
- Nom `.ss-conv-user-link` : Outfit 600, cream → amber au hover

---

## Zone messages `.ss-conv-messages-box`

- Carte glass : `background: rgba(14,34,32,0.72)`, `border: 1px solid rgba(212,146,42,0.18)`, `border-radius: 14px`, `backdrop-filter: blur(16px) saturate(1.4)`
- `max-height: 500px`, `overflow-y: auto`, `padding: 1.5rem`

### Empty state `.ss-conv-empty`
- Texte cream-muted, centré, `padding: 2rem`

### Rangées `.ss-conv-message-row`
- `display: flex`, `margin-bottom: 1rem`
- `.ss-conv-message-row--mine` : `justify-content: flex-end`
- `.ss-conv-message-row--theirs` : `justify-content: flex-start`

### Bulles `.ss-conv-bubble`
- `max-width: 70%`, `padding: 0.75rem 1rem`, `border-radius: 16px`
- **Mine** `.ss-conv-bubble--mine` : `background: #D4922A`, `color: #0C1E1C`, `border-bottom-right-radius: 4px`
- **Theirs** `.ss-conv-bubble--theirs` : `background: rgba(14,34,32,0.72)`, `border: 1px solid rgba(212,146,42,0.18)`, `color: #F7F2E8`, `border-bottom-left-radius: 4px`
- Texte `.ss-conv-bubble-text` : Outfit, `line-height: 1.5`, `word-break: break-word`
- Heure `.ss-conv-bubble-time` : `font-size: 0.7rem`, `color: rgba(247,242,232,0.55)`, `text-align: right`, `margin-top: 0.25rem`

### Message pending `.ss-conv-message-pending .ss-conv-bubble`
- `opacity: 0.65`

### Indicateur saisie `.ss-conv-typing`
- `color: rgba(247,242,232,0.65)`, `font-size: 0.85rem`, `margin: 0.5rem 0 0 0.5rem`
- Icône `fa-pen` : `color: #D4922A`

### Scrollbar `#messages-container`
- Thumb : `rgba(212,146,42,0.30)`, hover `rgba(212,146,42,0.55)`
- Track : transparent

---

## Formulaire `.ss-conv-send-box`

- Carte glass
- Layout : `display: flex`, `gap: 0.75rem`, `align-items: center`
- Input `.ss-conv-input` :
  - `flex: 1`, `background: rgba(14,34,32,0.72)`, `border: 1px solid rgba(212,146,42,0.18)`, `border-radius: 10px`
  - `color: #F7F2E8`, placeholder `rgba(247,242,232,0.40)`
  - Focus : `border-color: rgba(212,146,42,0.50)`, `outline: none`
  - `padding: 0.75rem 1rem`, `font-family: 'Outfit', sans-serif`
- Bouton `.ss-conv-send-btn` :
  - `background: #D4922A`, `color: #0C1E1C`, `border: none`, `border-radius: 10px`
  - `padding: 0.75rem 1.1rem`, hover `#E8A63C`
  - Icône `fa-paper-plane`

---

## `chat.js` — sélecteurs mis à jour

| Ancien | Nouveau |
|---|---|
| `conv-message-row` | `ss-conv-message-row` |
| `conv-message-row-mine` | `ss-conv-message-row--mine` |
| `conv-message-row-theirs` | `ss-conv-message-row--theirs` |
| `conv-message-pending` | `ss-conv-message-pending` |
| `conv-bubble` | `ss-conv-bubble` |
| `conv-bubble-mine` | `ss-conv-bubble--mine` |
| `conv-bubble-theirs` | `ss-conv-bubble--theirs` |
| `conv-bubble-text` | `ss-conv-bubble-text` |
| `conv-bubble-time` | `ss-conv-bubble-time` |
| `mb-4` (dans innerHTML) | *(supprimé, margin géré en CSS)* |
| `is-size-7 mt-1` (dans innerHTML) | *(supprimés)* |

---

## Responsive

- ≤ 768px : `.ss-conv-bubble` → `max-width: 85%`
- ≤ 480px : `.ss-conv-bubble` → `max-width: 90%`, `padding: 0.6rem 0.8rem` / `#messages-container` → `max-height: 400px`

---

## Fichiers modifiés

| Fichier | Nature |
|---|---|
| `style.md` | +1 ligne préfixe `ss-conv-` |
| `public/css/messages.css` | Réécriture section `conv-` (garder section `ss-msg-`) |
| `views/pages/conversation.ejs` | Réécriture complète |
| `public/js/chat.js` | Mise à jour sélecteurs |

---

## Contraintes

- `messages.css` contient aussi les styles `ss-msg-` (messages.ejs) → **ne pas supprimer** les règles `ss-msg-`
- `chat.js` utilise les sélecteurs CSS dans `querySelectorAll` et dans les templates `innerHTML` → tous les `conv-` doivent être renommés en `ss-conv-`
- FA CDN dans `conversation.ejs` : supprimer (FA déjà chargé dans header partial)
- `data-message-id`, `id="messages-container"`, `id="typing-indicator"`, `id="message-form"`, `id="message-input"`, `id="message-submit"` : conservés (utilisés par `chat.js`)
