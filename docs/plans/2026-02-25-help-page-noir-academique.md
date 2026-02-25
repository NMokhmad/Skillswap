# Migration Noir Académique — Page Aide

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrer `help_page.ejs` et `help_page.css` vers l'esthétique « Noir Académique » définie dans `style.md`, en supprimant toutes les classes Bulma et en adoptant la nomenclature `ss-help-`.

**Architecture:** Réécriture complète de l'EJS (suppression `columns`/`section`/`container` Bulma, nouvelles classes `ss-help-`) et du CSS (palette Noir Académique, variables locales, Grid/Flex pur). Mise à jour mineure de `faqToggle.js` (`is-hidden` → `ss-hidden`). Ajout de `ss-help-` dans la table nomenclature de `style.md`.

**Tech Stack:** EJS, CSS pur (Flexbox, Custom Properties), Vanilla JS, Font Awesome (déjà chargé via le partial header)

---

## Task 1 : Mettre à jour `style.md`

**Fichiers :**
- Modify: `style.md:169`

**Step 1 : Ajouter la ligne `ss-help-` dans la table des nomenclatures**

Dans `style.md`, trouver le tableau des préfixes de la section « Nomenclature des classes »
et ajouter la ligne `Aide` après `Mon Profil` :

```markdown
| Aide       | `ss-help-`   |
```

Résultat attendu du tableau :

```markdown
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
| Aide       | `ss-help-`   |
```

**Step 2 : Commit**

```bash
git add style.md
git commit -m "docs: style.md — ajouter préfixe ss-help- dans la nomenclature"
```

---

## Task 2 : Réécrire `public/css/help_page.css`

**Fichiers :**
- Modify (réécriture complète): `public/css/help_page.css`

**Step 1 : Remplacer tout le contenu du fichier**

```css
/* ===== Page Aide — Noir Académique ===== */
:root {
  --help-bg:       #0C1E1C;
  --help-card:     rgba(14, 34, 32, 0.72);
  --help-border:   rgba(212, 146, 42, 0.18);
  --help-border-h: rgba(212, 146, 42, 0.35);
  --help-amber:    #D4922A;
  --help-amber-h:  #E8A63C;
  --help-cream:    #F7F2E8;
  --help-muted:    rgba(247, 242, 232, 0.65);
  --help-dim:      rgba(247, 242, 232, 0.40);
}

html, body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--help-bg);
}

footer { width: 100%; margin-top: auto; }

.ss-hidden { display: none !important; }

/* ── Header ── */
.ss-help-header {
  background: rgba(14, 34, 32, 0.60);
  border-bottom: 1px solid rgba(212, 146, 42, 0.15);
  padding: 4rem 1.5rem;
  text-align: center;
}

.ss-help-header-icon {
  font-size: 3rem;
  color: var(--help-amber);
  display: block;
  margin-bottom: 1rem;
}

.ss-help-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 600;
  font-style: italic;
  color: var(--help-amber);
  margin: 0 0 0.5rem;
}

.ss-help-subtitle {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  color: var(--help-muted);
  margin: 0;
}

/* ── Main ── */
.ss-help-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-help-container {
  max-width: 860px;
  margin: 0 auto;
}

/* ── Badge astuce ── */
.ss-help-tip {
  background: var(--help-card);
  border: 1px solid var(--help-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ss-help-tip-icon {
  font-size: 1.6rem;
  color: var(--help-amber);
  flex-shrink: 0;
}

.ss-help-tip-text {
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: var(--help-cream);
  line-height: 1.5;
  margin: 0;
}

.ss-help-tip-text strong {
  color: var(--help-amber);
}

/* ── Titre de section ── */
.ss-help-section-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--help-cream);
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ss-help-section-title i {
  color: var(--help-amber);
}

/* ── Section FAQ ── */
.ss-help-faq {
  margin-bottom: 3rem;
}

.ss-help-faq-card {
  background: var(--help-card);
  border: 1px solid var(--help-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.25rem 1.5rem;
  margin-bottom: 0.75rem;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}

.ss-help-faq-card:hover {
  transform: translateY(-6px);
  border-color: var(--help-border-h);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.ss-help-faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.ss-help-faq-question {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--help-cream);
  margin: 0;
  flex: 1;
}

.ss-help-faq-toggle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--help-amber);
  color: #0C1E1C;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Outfit', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease, transform 0.2s ease;
  line-height: 1;
  padding: 0;
}

.ss-help-faq-toggle:hover {
  background: var(--help-amber-h);
  transform: rotate(90deg);
}

.ss-help-faq-toggle.active {
  transform: rotate(45deg);
}

.ss-help-faq-answer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 146, 42, 0.15);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: var(--help-muted);
  line-height: 1.7;
  animation: ss-help-slide-down 0.3s ease-out;
}

.ss-help-faq-answer p { margin: 0; }

@keyframes ss-help-slide-down {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Section Contact ── */
.ss-help-contact { margin-top: 1rem; }

.ss-help-contact-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.ss-help-contact-card {
  background: var(--help-card);
  border: 1px solid var(--help-border);
  border-radius: 14px;
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 2rem 1.5rem;
  text-align: center;
  flex: 1;
  min-width: 200px;
  transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
}

.ss-help-contact-card:hover {
  transform: translateY(-6px);
  border-color: var(--help-border-h);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.ss-help-contact-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--help-amber);
  color: #0C1E1C;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  font-size: 1.5rem;
}

.ss-help-contact-label {
  font-family: 'Outfit', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  color: var(--help-cream);
  margin-bottom: 0.5rem;
}

.ss-help-contact-link {
  font-family: 'Outfit', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--help-amber);
  text-decoration: none;
  transition: color 0.2s ease;
  display: inline-block;
}

.ss-help-contact-link:hover {
  color: var(--help-amber-h);
  text-decoration: underline;
}

.ss-help-contact-subtext {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: var(--help-dim);
  margin-top: 0.5rem;
}

/* ── Responsive ── */
@media (max-width: 600px) {
  .ss-help-contact-grid { flex-direction: column; }
  .ss-help-contact-card { min-width: unset; }
}

@media (max-width: 480px) {
  .ss-help-main { padding: 1.5rem 1rem 3rem; }
}
```

**Step 2 : Vérification visuelle rapide**

Démarrer le serveur (`npm start` ou `node index.js`) et ouvrir `/aide` dans le navigateur.
S'assurer que la page s'affiche avec le fond sombre (#0C1E1C). Si la page est encore blanche/violette,
vider le cache navigateur (Ctrl+Shift+R).

**Step 3 : Commit**

```bash
git add public/css/help_page.css
git commit -m "style: help_page.css — migration Noir Académique, palette amber/cream, classes ss-help-"
```

---

## Task 3 : Réécrire `views/pages/help_page.ejs`

**Fichiers :**
- Modify (réécriture complète): `views/pages/help_page.ejs`

**Step 1 : Remplacer tout le contenu du fichier**

```ejs
<%- include('../partials/header.ejs') %>
<script src="/js/faqToggle.js" defer></script>
</head>

<body>
  <%- include('../partials/navbar.ejs') %>

  <!-- En-tête -->
  <div class="ss-help-header">
    <i class="fas fa-question-circle ss-help-header-icon"></i>
    <h1 class="ss-help-title">Besoin d'aide ?</h1>
    <p class="ss-help-subtitle">Nous sommes là pour vous accompagner</p>
  </div>

  <main class="ss-help-main">
    <div class="ss-help-container">

      <!-- Badge astuce -->
      <div class="ss-help-tip">
        <i class="fas fa-lightbulb ss-help-tip-icon"></i>
        <p class="ss-help-tip-text">
          <strong>Astuce :</strong> Consultez d'abord notre FAQ ci-dessous, vous y trouverez peut-être la réponse à votre question !
        </p>
      </div>

      <!-- Section FAQ -->
      <section class="ss-help-faq">
        <h2 class="ss-help-section-title">
          <i class="fas fa-comments"></i>
          Questions fréquentes
        </h2>

        <!-- Question 1 -->
        <div class="ss-help-faq-card">
          <div class="ss-help-faq-header">
            <p class="ss-help-faq-question">Comment puis-je créer un compte ?</p>
            <button class="ss-help-faq-toggle" data-target="answer-1">+</button>
          </div>
          <div class="ss-help-faq-answer ss-hidden" id="answer-1">
            <p>Pour créer un compte sur SkillSwap, clique simplement sur le bouton "S'inscrire" en haut à droite de la page d'accueil. Tu peux t'inscrire avec ton adresse e-mail. Une fois ton compte créé, tu pourras compléter ton profil, proposer des compétences, et commencer à échanger avec la communauté !</p>
          </div>
        </div>

        <!-- Question 2 -->
        <div class="ss-help-faq-card">
          <div class="ss-help-faq-header">
            <p class="ss-help-faq-question">Comment modifier mes informations personnelles ?</p>
            <button class="ss-help-faq-toggle" data-target="answer-2">+</button>
          </div>
          <div class="ss-help-faq-answer ss-hidden" id="answer-2">
            <p>Pour modifier tes informations personnelles, connecte-toi à ton compte, puis rends-toi dans la section "Profil" depuis le menu utilisateur. Tu pourras y mettre à jour ton nom, ta bio, tes disponibilités, tes compétences proposées et toutes les autres informations visibles par la communauté. N'oublie pas d'enregistrer les modifications !</p>
          </div>
        </div>

        <!-- Question 3 -->
        <div class="ss-help-faq-card">
          <div class="ss-help-faq-header">
            <p class="ss-help-faq-question">Est-ce que tout est vraiment gratuit ?</p>
            <button class="ss-help-faq-toggle" data-target="answer-3">+</button>
          </div>
          <div class="ss-help-faq-answer ss-hidden" id="answer-3">
            <p>Oui, SkillSwap est entièrement gratuit ! Notre objectif est de permettre aux utilisateurs de partager leurs compétences et d'en apprendre d'autres, sans échange d'argent. Il suffit de proposer une compétence pour en apprendre une autre en retour — tout est basé sur l'échange et l'entraide, sans frais.</p>
          </div>
        </div>
      </section>

      <!-- Section Contact -->
      <section class="ss-help-contact">
        <h2 class="ss-help-section-title">
          <i class="fas fa-envelope"></i>
          Contactez-nous
        </h2>

        <div class="ss-help-contact-grid">
          <div class="ss-help-contact-card">
            <div class="ss-help-contact-icon">
              <i class="fas fa-envelope"></i>
            </div>
            <div class="ss-help-contact-label">Par email</div>
            <a href="mailto:contact@skillswap.fr" class="ss-help-contact-link">
              contact@skillswap.fr
            </a>
            <p class="ss-help-contact-subtext">Réponse sous 24-48h</p>
          </div>

          <div class="ss-help-contact-card">
            <div class="ss-help-contact-icon">
              <i class="fas fa-phone"></i>
            </div>
            <div class="ss-help-contact-label">Par téléphone</div>
            <a href="tel:+33123456789" class="ss-help-contact-link">
              01 23 45 67 89
            </a>
            <p class="ss-help-contact-subtext">Lun-Ven : 9h-18h</p>
          </div>
        </div>
      </section>

    </div>
  </main>

  <%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Vérification visuelle**

Recharger `/aide` dans le navigateur et vérifier :
- Fond sombre #0C1E1C visible
- Titre « Besoin d'aide ? » en Cormorant Garamond italic amber
- 3 cartes FAQ avec fond glass et bordure amber
- 2 cartes contact côte à côte (ou empilées sur mobile)
- Aucune erreur dans la console navigateur

**Step 3 : Commit**

```bash
git add views/pages/help_page.ejs
git commit -m "feat: help_page.ejs — réécriture Noir Académique, suppression Bulma, classes ss-help-"
```

---

## Task 4 : Mettre à jour `public/js/faqToggle.js`

**Fichiers :**
- Modify: `public/js/faqToggle.js`

**Step 1 : Remplacer le contenu**

Le sélecteur doit cibler `.ss-help-faq-toggle` (nouveau nom de classe).
La classe toggle passe de `is-hidden` à `ss-hidden`.
Ajouter le toggle de la classe `active` pour déclencher la rotation CSS.

```js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".ss-help-faq-header .ss-help-faq-toggle");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const answer = document.getElementById(targetId);

      answer.classList.toggle("ss-hidden");

      const isOpen = !answer.classList.contains("ss-hidden");
      button.textContent = isOpen ? "-" : "+";
      button.classList.toggle("active", isOpen);
    });
  });
});
```

**Step 2 : Tester le toggle manuellement**

Dans le navigateur, sur `/aide` :
- Cliquer sur une question → la réponse s'affiche, le `+` devient `-`, le bouton tourne à 45°
- Cliquer à nouveau → la réponse se masque, le `-` redevient `+`
- Vérifier que les 3 questions fonctionnent indépendamment

**Step 3 : Commit**

```bash
git add public/js/faqToggle.js
git commit -m "fix: faqToggle.js — is-hidden → ss-hidden, sélecteur ss-help-faq-toggle, toggle active"
```

---

## Vérification finale

1. Démarrer le serveur : `node index.js`
2. Ouvrir `/aide`
3. Checklist visuelle :
   - [ ] Fond sombre `#0C1E1C`
   - [ ] Header avec titre Cormorant Garamond italic amber
   - [ ] Badge astuce glass avec icône amber
   - [ ] 3 cartes FAQ glass — hover `translateY(-6px)` avec bordure amber
   - [ ] Bouton toggle amber plein, rotation 45° à l'ouverture
   - [ ] Animation `slideDown` sur l'ouverture des réponses
   - [ ] 2 cartes contact glass avec icône amber plein
   - [ ] Responsive : contact 1 colonne sur mobile (≤ 600px)
4. Ouvrir la console navigateur → aucune erreur
