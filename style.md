# SkillSwap — Style Guide « Noir Académique »

## Couleurs

| Token            | Valeur                       | Usage                          |
|------------------|------------------------------|--------------------------------|
| `--bg`           | `#0C1E1C`                    | Fond de page                   |
| `--card`         | `rgba(14, 34, 32, 0.72)`     | Fond carte glass               |
| `--border`       | `rgba(212, 146, 42, 0.18)`   | Bordure carte (repos)          |
| `--border-hover` | `rgba(212, 146, 42, 0.35)`   | Bordure carte (hover)          |
| `--amber`        | `#D4922A`                    | Accent principal               |
| `--amber-h`      | `#E8A63C`                    | Accent hover                   |
| `--cream`        | `#F7F2E8`                    | Texte principal                |
| `--cream-muted`  | `rgba(247, 242, 232, 0.65)`  | Texte secondaire               |
| `--cream-dim`    | `rgba(247, 242, 232, 0.40)`  | Placeholder / texte tertiaire  |
| `--error`        | `rgba(220, 80, 80, 0.55)`    | Bordure erreur                 |
| `--error-bg`     | `rgba(220, 80, 80, 0.08)`    | Fond erreur                    |

---

## Typographie

| Rôle           | Police             | Style                  |
|----------------|--------------------|------------------------|
| Titres `h1–h3` | Cormorant Garamond | italic, weight 600     |
| Corps / UI     | Outfit             | normal, weight 400–600 |

```css
/* Titre de page */
font-family: 'Cormorant Garamond', serif;
font-size: clamp(2rem, 5vw, 3rem);
font-weight: 600;
font-style: italic;
color: #D4922A;

/* Sous-titre */
font-family: 'Outfit', sans-serif;
font-size: 1rem;
color: rgba(247, 242, 232, 0.65);

/* Label UI (boutons, champs) */
font-family: 'Outfit', sans-serif;
font-size: 0.88rem;
font-weight: 600;
```

---

## Carte Glass

Patron commun à toutes les pages (register, onboarding, login, talents, skills).

```css
background: rgba(14, 34, 32, 0.72);
border: 1px solid rgba(212, 146, 42, 0.18);
border-radius: 14px;
backdrop-filter: blur(16px) saturate(1.4);
transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
```

Hover :
```css
transform: translateY(-6px);
border-color: rgba(212, 146, 42, 0.35);
box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
```

---

## Composants récurrents

### Bouton primaire (amber plein)
```css
background: #D4922A;
color: #0C1E1C;
border: none;
border-radius: 8px;
font-family: 'Outfit', sans-serif;
font-weight: 700;
padding: 0.75rem 1rem;
transition: background 0.2s ease, transform 0.2s ease;
```
Hover : `background: #E8A63C; transform: translateY(-1px)`

### Bouton secondaire (outline amber)
```css
background: transparent;
border: 1px solid #D4922A;
color: #D4922A;
border-radius: 8px;
font-family: 'Outfit', sans-serif;
font-weight: 600;
```
Hover : `background: #D4922A; color: #0C1E1C`

### Champ de formulaire
```css
background: rgba(14, 34, 32, 0.50);
border: 1px solid rgba(212, 146, 42, 0.20);
border-radius: 8px;
color: #F7F2E8;
font-family: 'Outfit', sans-serif;
padding: 0.65rem 0.9rem;
```
Focus : `border-color: rgba(212, 146, 42, 0.55); outline: none`

### Pill / tag
```css
border: 1px solid rgba(212, 146, 42, 0.30);
border-radius: 20px;
padding: 0.25rem 0.75rem;
font-size: 0.75rem;
color: rgba(247, 242, 232, 0.75);
font-family: 'Outfit', sans-serif;
```
Hover : `background: #D4922A; color: #0C1E1C; border-color: #D4922A`

### Séparateur de sections
```css
border: none;
border-top: 1px solid rgba(212, 146, 42, 0.15);
margin: 2rem 0;
```

---

## Header de page (listing)

```css
background: rgba(14, 34, 32, 0.60);
border-bottom: 1px solid rgba(212, 146, 42, 0.15);
padding: 4rem 1.5rem;
text-align: center;
```

Stat-box dans le header :
```css
background: rgba(14, 34, 32, 0.72);
border: 1px solid rgba(212, 146, 42, 0.18);
border-radius: 12px;
padding: 0.75rem 1.75rem;
backdrop-filter: blur(10px);
```

---

## Grille (pages listing)

```css
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1.5rem;
max-width: 1200px;
margin: 0 auto;
```

| Breakpoint  | Colonnes |
|-------------|----------|
| `> 900px`   | 3        |
| `600–900px` | 2        |
| `< 600px`   | 1        |

---

## Nomenclature des classes

Préfixe `ss-` + identifiant de page + composant :

| Page       | Préfixe      |
|------------|--------------|
| Navbar     | `ss-nav-`    |
| Footer     | `ss-footer-` |
| Homepage   | `ss-hero-`   |
| Register   | `ss-reg-`    |
| Onboarding | `ss-ob-`     |
| Login      | `ss-login-`  |
| Talents    | `ss-tal-`    |
| Skills     | `ss-sk-`     |
| Mon Profil | `ss-profil-` |

---

## Responsive — règles générales

```css
@media (max-width: 900px) { /* tablette */ }
@media (max-width: 600px) { /* mobile */ }
@media (max-width: 480px) { /* petit mobile */ }
```

Utiliser `clamp()` pour les tailles de police :
```css
font-size: clamp(1.6rem, 4vw, 2.5rem);
```

---

## Conventions CSS

- Pas de Bulma. CSS pur uniquement (Grid, Flexbox, Custom Properties).
- Variables CSS définies dans `:root` ou localement sur le composant.
- Pas de `!important` sauf héritage Bulma résiduel à écraser (migration en cours).
- JS inline avec `nonce="<%= cspNonce %>"` pour tous les scripts de page.
- Pas de fichiers JS externes pour les pages auth (register, onboarding, login).
