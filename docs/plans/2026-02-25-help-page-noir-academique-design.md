# Design — Migration Noir Académique · Page Aide

**Date :** 2026-02-25
**Branche :** migration
**Approche retenue :** A — Migration fidèle

---

## Objectif

Appliquer l'esthétique « Noir Académique » définie dans `style.md` à la page aide
(`help_page.ejs` / `help_page.css`), en supprimant toutes les dépendances Bulma et
en adoptant la nomenclature `ss-help-`.

---

## Fichiers modifiés

| Fichier | Nature |
|---|---|
| `views/pages/help_page.ejs` | Réécriture complète — suppression classes Bulma, nouvelles classes `ss-help-` |
| `public/css/help_page.css` | Réécriture complète — palette Noir Académique, variables CSS locales |
| `public/js/faqToggle.js` | Minor — `is-hidden` → `ss-hidden` |
| `style.md` | Ajout `\| Aide \| ss-help- \|` dans la table des nomenclatures |

---

## Variables CSS locales (`:root`)

```css
--help-bg:        #0C1E1C;
--help-card:      rgba(14, 34, 32, 0.72);
--help-border:    rgba(212, 146, 42, 0.18);
--help-border-h:  rgba(212, 146, 42, 0.35);
--help-amber:     #D4922A;
--help-amber-h:   #E8A63C;
--help-cream:     #F7F2E8;
--help-muted:     rgba(247, 242, 232, 0.65);
--help-dim:       rgba(247, 242, 232, 0.40);
```

---

## Composants

### Header `.ss-help-header`
- Fond : `rgba(14, 34, 32, 0.60)`
- Bordure bas : `1px solid rgba(212, 146, 42, 0.15)`
- Padding : `4rem 1.5rem`, `text-align: center`
- Icône FA (`fa-question-circle`) : couleur `--help-amber`, taille `3rem`
- Titre `.ss-help-title` : Cormorant Garamond italic 600, `clamp(2rem,5vw,3rem)`, amber
- Sous-titre `.ss-help-subtitle` : Outfit 1rem, `--help-muted`

### Badge astuce `.ss-help-tip`
- Carte glass (patron commun) avec `backdrop-filter: blur(16px) saturate(1.4)`
- Icône ampoule amber, texte cream
- Pas de hover interactif (informatif seulement)

### Section FAQ `.ss-help-faq`
- Titre `.ss-help-section-title` : Outfit 1.6rem 600, cream + icône amber
- Séparateur `hr` amber 0.15 entre le titre et les cartes

### Carte FAQ `.ss-help-faq-card`
- Patron carte glass : `background: rgba(14,34,32,0.72)`, `border: 1px solid rgba(212,146,42,0.18)`, `border-radius: 14px`, `backdrop-filter: blur(16px) saturate(1.4)`
- Hover : `translateY(-6px)`, `border-color: rgba(212,146,42,0.35)`, `box-shadow: 0 12px 32px rgba(0,0,0,0.25)`
- Bordure uniforme amber (suppression de l'alternance rose/bleu actuelle)

### Bouton toggle `.ss-help-faq-toggle`
- Bouton amber plein 32×32px, `border-radius: 50%`, bg `--help-amber`, color `#0C1E1C`
- Hover : `background: --help-amber-h; transform: rotate(90deg)`
- État actif (réponse ouverte) : `transform: rotate(45deg)`

### Réponse FAQ `.ss-help-faq-answer`
- Texte `--help-muted`, `line-height: 1.7`
- Séparateur haut : `border-top: 1px solid rgba(212,146,42,0.15)`
- Animation `slideDown` conservée

### Section Contact `.ss-help-contact`
- Titre identique au titre FAQ
- Grille : `display: flex; gap: 1.5rem; flex-wrap: wrap`
  - > 600px : 2 colonnes égales
  - ≤ 600px : 1 colonne

### Carte contact `.ss-help-contact-card`
- Patron carte glass, `text-align: center`
- Icône `.ss-help-contact-icon` : cercle amber plein 60×60px, icône FA blanche
- Label `.ss-help-contact-label` : Outfit 600 1.05rem, cream
- Lien `.ss-help-contact-link` : amber, hover amber-h + underline
- Sous-texte `.ss-help-contact-subtext` : `--help-dim`, 0.9rem

---

## Responsive

```css
@media (max-width: 900px) { /* tablette — pas de changement majeur */ }
@media (max-width: 600px) { /* mobile — contact passe en 1 colonne */ }
```

---

## Décisions & contraintes

- **Pas de Bulma** : classes `columns`, `column is-half`, `section`, `container` supprimées du EJS
- **`is-hidden` → `ss-hidden`** dans `faqToggle.js` (cohérence avec les autres pages migrées)
- **`ss-hidden`** défini en CSS : `display: none !important`
- La nomenclature `ss-help-` sera ajoutée à `style.md`
