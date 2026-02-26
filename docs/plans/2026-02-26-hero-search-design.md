# Design — Barre de recherche Hero (Homepage)

**Date :** 2026-02-26
**Statut :** Approuvé

## Problème

La homepage ne donne aucun accès direct à `/search`, la page de recherche avancée. Les deux CTAs hero pointent tous les deux vers `/talents` (browse passif). L'utilisateur avec une intention précise (trouver quelqu'un) n'a pas de point d'entrée évident.

## Solution retenue

Ajouter une barre de recherche de talents dans la section hero de la homepage, **sous les boutons CTA existants**, avec autocomplete en temps réel.

## Comportement

- L'utilisateur tape un nom dans la barre
- Après 250 ms de debounce, une requête GET est envoyée à `/api/search/autocomplete?q=<input>`
- Un dropdown affiche jusqu'à 5 suggestions (prénom + nom + ville)
- Clic sur une suggestion → `window.location = '/search?q=<fullname>'`
- Soumission du formulaire (Enter ou bouton) → `window.location = '/search?q=<input>'`
- Clic en dehors du dropdown → ferme le dropdown

## Architecture

**Approche :** widget autonome — aucune dépendance à `search.js`.

### Fichiers modifiés

| Fichier | Changement |
|---|---|
| `views/pages/homepage.ejs` | Ajout bloc `.ss-hero-search` + `<script>` inline (~40 lignes) |
| `public/css/homepage.css` | Ajout styles `.ss-hero-search`, `.ss-hero-search-input`, `.ss-hero-search-btn`, `.ss-hero-search-dropdown`, `.ss-hero-search-item` |

### Aucun fichier créé

Le JS est inline dans `homepage.ejs` pour rester autonome et éviter un fichier JS dédié pour si peu de logique.

## Design visuel

Palette **Noir Académique** cohérente avec le reste du hero :
- Input : fond `rgba(247,242,232,0.06)`, bordure `rgba(247,242,232,0.12)`, texte crème
- Bouton : amber `#D4922A`, hover `#E8A63C`
- Dropdown : fond `#0C1E1C`, bordure amber, suggestions avec hover amber

## Structure HTML

```
<div class="ss-hero-search">
  <div class="ss-hero-search-wrap">
    <input type="text" class="ss-hero-search-input" placeholder="Rechercher un talent..." autocomplete="off">
    <button class="ss-hero-search-btn"><i class="fa-solid fa-search"></i> Rechercher</button>
    <div class="ss-hero-search-dropdown" hidden></div>
  </div>
</div>
```

## Hors périmètre

- Pas de refactoring de `search.js`
- Pas de recherche par compétence
- Pas de modification de `/talents`
