# Design Document — Page Register
Date: 2026-02-25

## Contexte

Refonte de la page d'inscription (`/register`) pour aligner sur l'esthétique "Noir Académique" établie pour la homepage, la navbar et le footer. Suppression complète de Bulma CSS.

## Décisions de design

- **Layout** : Carte centrée sur fond plein écran sombre
- **Champs Nom/Prénom** : Côte à côte (grid 2 colonnes, s'empilent sur mobile)
- **Éléments supplémentaires** : Lien /login, barre de force du mot de passe, indicateurs de critères

## Architecture HTML

```
<body class="ss-reg-body">
  <div class="ss-reg-page">
    <div class="ss-reg-card">
      <div class="ss-reg-header">
        <h1 class="ss-reg-title">Rejoignez <em>SkillSwap</em></h1>
        <p class="ss-reg-subtitle">Créez votre compte gratuitement</p>
      </div>
      <form method="POST" action="/register">
        <div class="ss-reg-row">
          <!-- lastname field -->
          <!-- firstname field -->
        </div>
        <!-- email field -->
        <!-- password field + strength bar + criteria -->
        <!-- confirmPassword field -->
        <button type="submit" class="ss-reg-btn">S'inscrire</button>
        <p class="ss-reg-login-link">
          Déjà un compte ? <a href="/login">Se connecter</a>
        </p>
      </form>
    </div>
  </div>
</body>
```

## Palette de couleurs

| Variable              | Valeur                            | Usage                     |
|-----------------------|-----------------------------------|---------------------------|
| `--reg-bg`            | `#0C1E1C`                         | Fond de page              |
| `--reg-card-bg`       | `rgba(14, 34, 32, 0.72)`          | Fond de carte             |
| `--reg-border`        | `rgba(212, 146, 42, 0.18)`        | Bordure carte             |
| `--reg-amber`         | `#D4922A`                         | Accent principal          |
| `--reg-amber-h`       | `#E8A63C`                         | Hover amber               |
| `--reg-cream`         | `#F7F2E8`                         | Texte principal           |
| `--reg-cream-4`       | `rgba(247, 242, 232, 0.42)`       | Texte secondaire          |
| `--reg-error`         | `rgba(220, 80, 80, 0.85)`         | Erreur                    |
| `--strength-weak`     | `#dc5050`                         | Barre force : faible      |
| `--strength-medium`   | `#e89a3c`                         | Barre force : moyen       |
| `--strength-strong`   | `#52b788`                         | Barre force : fort        |

## Typographie

- Titres : `Cormorant Garamond`, italic, 2.2rem
- Corps / labels / inputs : `Outfit`, 0.85rem

## Composants

### Carte (`.ss-reg-card`)
- `max-width: 500px`, `width: min(500px, 100% - 2rem)`
- `backdrop-filter: blur(16px) saturate(1.4)`
- `border-radius: 16px`, `padding: 2.5rem`
- Box-shadow double : profondeur + glow amber inset

### Champs (`.ss-reg-field`)
- Label uppercase, 0.7rem, letter-spacing 0.12em, amber
- Input fond semi-transparent, bordure subtile
- Focus : bordure amber + glow ring `rgba(212,146,42,0.12)`
- Erreur : bordure rouge + message `.ss-reg-error-msg` en rouge

### Grille Nom/Prénom (`.ss-reg-row`)
- `display: grid; grid-template-columns: 1fr 1fr; gap: 1rem`
- `@media (max-width: 480px)` → `grid-template-columns: 1fr`

### Barre de force (`.ss-strength-bar`)
- 4 segments `div.ss-strength-seg`
- Score JS : longueur ≥8, majuscule, chiffre, caractère spécial
- 0/4 → gris · 1/4 → rouge · 2/4 → rouge · 3/4 → orange · 4/4 → vert

### Critères (`.ss-criteria-list`)
- 4 items : `≥ 8 caractères`, `1 majuscule`, `1 chiffre`, `1 caractère spécial`
- Icône `✓` vert / `✗` rouge, texte cream opacité variable
- Mis à jour en temps réel via JS (`input` event)

## JavaScript (inline, noncé)

Logique purement front — aucun appel API :
1. Écouter `input` sur le champ `password`
2. Calculer un score 0-4 (longueur, majuscule, chiffre, spécial)
3. Activer les segments de la barre et les icônes de critères

## Gestion des erreurs serveur

Erreurs passées via `errors` (objet EJS) :
- `errors.lastname`, `errors.firstname`, `errors.email`, `errors.password`, `errors.confirmPassword`
- Classe `has-error` sur `.ss-reg-field` si erreur présente

## Responsive

| Breakpoint  | Changement                                            |
|-------------|-------------------------------------------------------|
| `< 480px`   | Nom/Prénom empilés, padding carte réduit à 1.5rem    |
| `< 360px`   | Font-size titre réduit à 1.75rem                     |

## Fichiers à modifier

1. `views/pages/register.ejs` — Réécriture complète, classes `ss-reg-*`
2. `public/css/register.css` — Réécriture complète, esthétique Noir Académique
