# Conversation Noir Académique Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrer `conversation.ejs` et la section `conv-` de `messages.css` vers l'esthétique Noir Académique, en supprimant toutes les dépendances Bulma et en renommant les sélecteurs CSS de `conv-` vers `ss-conv-`.

**Architecture:** 4 fichiers touchés — `style.md` (nomenclature), `messages.css` (section `conv-` uniquement), `conversation.ejs` (réécriture EJS), `chat.js` (sélecteurs CSS + refactor renderMessage). Le CSS existant `ss-msg-` dans `messages.css` est conservé intact. Le JS `chat.js` gère le temps réel (Socket.IO) et génère du HTML via DOM methods — tous les sélecteurs doivent être mis à jour simultanément avec l'EJS.

**Tech Stack:** EJS, CSS vanilla (custom properties, flexbox), JavaScript vanilla (Socket.IO), Express.js, Font Awesome 6 (chargé via header partial)

---

## Contexte important

- `messages.css` contient **deux sections** : `ss-msg-` (lignes 1–193, NE PAS TOUCHER) et `conv-` (lignes 195–368, à réécrire)
- `chat.js` crée des éléments DOM avec des classes `conv-` hardcodées — doit être mis à jour en même temps que l'EJS
- FA CDN (`script src="https://kit.fontawesome.com/626daf36fc.js"`) à supprimer de `conversation.ejs` (FA déjà dans header partial)
- IDs conservés car utilisés par `chat.js` : `conversation-page`, `messages-container`, `typing-indicator`, `message-form`, `message-input`, `message-submit`
- `data-current-user-id` et `data-other-user-id` sur `#conversation-page` : conservés
- `renderMessage` dans `chat.js` sera refactorisée avec `createElement` (suppression de `innerHTML` pour éviter tout risque XSS)

---

### Task 1 : Mettre à jour style.md

**Files:**
- Modify: `style.md:184`

**Step 1 : Ajouter la ligne `ss-conv-` dans la table nomenclature**

Trouver la ligne `| Messages            | \`ss-msg-\`    |` et ajouter après :

```
| Conversation        | `ss-conv-`   |
```

**Step 2 : Vérifier**

```bash
grep "ss-conv-" style.md
```

Expected: `| Conversation        | \`ss-conv-\`   |`

**Step 3 : Commit**

```bash
git add style.md
git commit -m "docs: style.md — ajouter préfixe ss-conv- dans la nomenclature"
```

---

### Task 2 : Réécrire la section `conv-` de `messages.css`

**Files:**
- Modify: `public/css/messages.css:195-368`

**Step 1 : Remplacer tout depuis le commentaire `conv-` jusqu'à la fin du fichier**

Garder intact tout ce qui précède la ligne 195 (section `ss-msg-`).
Remplacer depuis `/* ══ Conversation page (conv- prefix) ══ */` jusqu'à la fin par le CSS suivant.

Le CSS complet de la section conv- à écrire :

```
/* ══════════════════════════════════════
   Conversation page (ss-conv- prefix)
   ══════════════════════════════════════ */

:root {
  --conv-bg: #0C1E1C;
  --conv-card: rgba(14, 34, 32, 0.72);
  --conv-border: rgba(212, 146, 42, 0.18);
  --conv-border-hover: rgba(212, 146, 42, 0.35);
  --conv-amber: #D4922A;
  --conv-amber-hover: #E8A63C;
  --conv-cream: #F7F2E8;
  --conv-muted: rgba(247, 242, 232, 0.65);
  --conv-dim: rgba(247, 242, 232, 0.40);
  --conv-radius: 14px;
}

.ss-conv-main {
  flex: 1;
  padding: 2.5rem 1.5rem 4rem;
}

.ss-conv-container {
  max-width: 700px;
  margin: 0 auto;
}

/* — Header — */

.ss-conv-header {
  background: var(--conv-card);
  border: 1px solid var(--conv-border);
  border-radius: var(--conv-radius);
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.ss-conv-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--conv-amber);
  text-decoration: none;
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  flex-shrink: 0;
  transition: color 0.2s ease;
}

.ss-conv-back:hover { color: var(--conv-amber-hover); }

.ss-conv-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(212, 146, 42, 0.20);
  border: 2px solid rgba(212, 146, 42, 0.30);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ss-conv-avatar-initials {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--conv-cream);
}

.ss-conv-user-link {
  font-family: 'Outfit', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--conv-cream);
  text-decoration: none;
  transition: color 0.2s ease;
}

.ss-conv-user-link:hover { color: var(--conv-amber); }

/* — Zone messages — */

.ss-conv-messages-box {
  background: var(--conv-card);
  border: 1px solid var(--conv-border);
  border-radius: var(--conv-radius);
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1.5rem;
  max-height: 500px;
  overflow-y: auto;
  margin-bottom: 0.5rem;
}

.ss-conv-empty {
  text-align: center;
  padding: 2rem;
  font-family: 'Outfit', sans-serif;
  color: var(--conv-muted);
  margin: 0;
}

.ss-conv-message-row {
  display: flex;
  margin-bottom: 1rem;
}

.ss-conv-message-row--mine   { justify-content: flex-end; }
.ss-conv-message-row--theirs { justify-content: flex-start; }

/* — Bulles — */

.ss-conv-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 16px;
}

.ss-conv-bubble--mine {
  background: var(--conv-amber);
  color: #0C1E1C;
  border-bottom-right-radius: 4px;
}

.ss-conv-bubble--theirs {
  background: var(--conv-card);
  border: 1px solid var(--conv-border);
  color: var(--conv-cream);
  border-bottom-left-radius: 4px;
}

.ss-conv-bubble-text {
  font-family: 'Outfit', sans-serif;
  line-height: 1.5;
  word-break: break-word;
  margin: 0;
}

.ss-conv-bubble-time {
  font-family: 'Outfit', sans-serif;
  font-size: 0.7rem;
  color: rgba(247, 242, 232, 0.55);
  text-align: right;
  margin: 0.25rem 0 0;
}

.ss-conv-bubble--mine .ss-conv-bubble-time {
  color: rgba(12, 30, 28, 0.55);
}

.ss-conv-message-pending .ss-conv-bubble {
  opacity: 0.65;
}

/* — Indicateur saisie — */

.ss-conv-typing {
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  color: var(--conv-muted);
  margin: 0 0 0.75rem 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ss-conv-typing i { color: var(--conv-amber); }

/* — Formulaire d'envoi — */

.ss-conv-send-box {
  background: var(--conv-card);
  border: 1px solid var(--conv-border);
  border-radius: var(--conv-radius);
  backdrop-filter: blur(16px) saturate(1.4);
  padding: 1rem 1.25rem;
}

.ss-conv-send-form {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
}

.ss-conv-input {
  flex: 1;
  background: rgba(14, 34, 32, 0.60);
  border: 1px solid var(--conv-border);
  border-radius: 10px;
  color: var(--conv-cream);
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  padding: 0.75rem 1rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.ss-conv-input::placeholder { color: var(--conv-dim); }
.ss-conv-input:focus { border-color: rgba(212, 146, 42, 0.50); }

.ss-conv-send-btn {
  background: var(--conv-amber);
  color: #0C1E1C;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.1rem;
  font-size: 1rem;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.ss-conv-send-btn:hover { background: var(--conv-amber-hover); }

/* — Scrollbar — */

#messages-container::-webkit-scrollbar { width: 6px; }
#messages-container::-webkit-scrollbar-track { background: transparent; }

#messages-container::-webkit-scrollbar-thumb {
  background: rgba(212, 146, 42, 0.30);
  border-radius: 3px;
}

#messages-container::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 146, 42, 0.55);
}

/* — Responsive — */

@media (max-width: 768px) {
  .ss-conv-bubble { max-width: 85%; }
}

@media (max-width: 480px) {
  .ss-conv-main { padding: 1.5rem 1rem 3rem; }

  .ss-conv-bubble {
    max-width: 90%;
    padding: 0.6rem 0.8rem;
  }

  #messages-container { max-height: 400px; }
}
```

**Step 2 : Vérifier que la section ss-msg- est intacte**

```bash
grep -n "ss-msg-main\|ss-conv-main" public/css/messages.css
```

Expected: deux lignes, une pour `ss-msg-main` (ligne < 20) et une pour `ss-conv-main` (après ligne 195).

**Step 3 : Vérifier qu'aucune classe `conv-` (sans ss-) ne subsiste**

```bash
grep -n "\.conv-" public/css/messages.css
```

Expected: aucune sortie (0 résultats).

**Step 4 : Commit**

```bash
git add public/css/messages.css
git commit -m "feat: messages.css — réécriture section conv- Noir Académique (ss-conv-)"
```

---

### Task 3 : Réécrire `conversation.ejs`

**Files:**
- Modify: `views/pages/conversation.ejs`

**Step 1 : Remplacer le contenu entier du fichier**

Supprimer : FA CDN, `section`, `container`, `columns is-centered`, `column is-8`, `box`, `is-flex`, `field has-addons`, toutes classes Bulma.

Structure du nouveau fichier :

```
<%- include('../partials/header.ejs') %>
</head>

<body>
<%- include('../partials/navbar.ejs') %>

<main
    class="ss-conv-main"
    id="conversation-page"
    data-current-user-id="<%= currentUserId %>"
    data-other-user-id="<%= otherUser.id %>"
>
    <div class="ss-conv-container">

        <!-- Header -->
        <div class="ss-conv-header">
            <a href="/messages" class="ss-conv-back">
                <i class="fas fa-arrow-left"></i>
                Retour
            </a>
            <div class="ss-conv-avatar">
                <span class="ss-conv-avatar-initials">
                    <%= otherUser.firstname.charAt(0).toUpperCase() %><%= otherUser.lastname.charAt(0).toUpperCase() %>
                </span>
            </div>
            <a href="/talents/<%= otherUser.id %>" class="ss-conv-user-link">
                <%= otherUser.firstname %> <%= otherUser.lastname %>
            </a>
        </div>

        <!-- Messages -->
        <div class="ss-conv-messages-box" id="messages-container">
            <% if (messages.length === 0) { %>
                <p class="ss-conv-empty">
                    Aucun message. Commencez la conversation !
                </p>
            <% } %>

            <% messages.forEach(msg => { %>
                <% const isMine = msg.sender_id === currentUserId; %>
                <div class="ss-conv-message-row <%= isMine ? 'ss-conv-message-row--mine' : 'ss-conv-message-row--theirs' %>" data-message-id="<%= msg.id %>">
                    <div class="ss-conv-bubble <%= isMine ? 'ss-conv-bubble--mine' : 'ss-conv-bubble--theirs' %>">
                        <p class="ss-conv-bubble-text"><%= msg.content %></p>
                        <p class="ss-conv-bubble-time">
                            <%= new Date(msg.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) %>
                        </p>
                    </div>
                </div>
            <% }) %>
        </div>

        <div id="typing-indicator" class="ss-conv-typing" hidden>
            <i class="fas fa-pen"></i>
            <span><%= otherUser.firstname %> est en train d'écrire...</span>
        </div>

        <!-- Formulaire d'envoi -->
        <div class="ss-conv-send-box">
            <form action="/messages/<%= otherUser.id %>" method="POST" id="message-form" class="ss-conv-send-form">
                <input
                    class="ss-conv-input"
                    id="message-input"
                    type="text"
                    name="content"
                    placeholder="Écrire un message..."
                    required
                    autocomplete="off"
                >
                <button type="submit" class="ss-conv-send-btn" id="message-submit">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>

    </div>
</main>

<script nonce="<%= cspNonce %>">
    const container = document.getElementById('messages-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
</script>
<script src="/js/chat.js" defer></script>

<%- include('../partials/footer.ejs') %>
</body>
</html>
```

**Step 2 : Vérifier qu'aucune classe Bulma ne subsiste**

```bash
grep -n "columns\|column is-\|\.box\|is-flex\|has-addons\|is-medium\|is-size-7\|mr-[0-9]\|ml-[0-9]\|mb-[0-9]\|mt-[0-9]" views/pages/conversation.ejs
```

Expected: aucune sortie (0 résultats).

**Step 3 : Vérifier que le FA CDN est supprimé**

```bash
grep -n "kit.fontawesome" views/pages/conversation.ejs
```

Expected: aucune sortie.

**Step 4 : Commit**

```bash
git add views/pages/conversation.ejs
git commit -m "feat: conversation.ejs — réécriture Noir Académique, suppression Bulma"
```

---

### Task 4 : Mettre à jour `chat.js`

**Files:**
- Modify: `public/js/chat.js`

**Changements par rapport à l'original :**

1. Sélecteurs renommés :
   - `conv-message-row` → `ss-conv-message-row`
   - `conv-message-row-mine` → `ss-conv-message-row--mine`
   - `conv-message-row-theirs` → `ss-conv-message-row--theirs`
   - `conv-message-pending` → `ss-conv-message-pending`
   - `conv-bubble` → `ss-conv-bubble`
   - `conv-bubble-mine` → `ss-conv-bubble--mine`
   - `conv-bubble-theirs` → `ss-conv-bubble--theirs`
   - `conv-bubble-text` → `ss-conv-bubble-text`
   - `conv-bubble-time` → `ss-conv-bubble-time`

2. `renderMessage` refactorisée avec `createElement` au lieu de `innerHTML` (supprime `mb-4`, `is-size-7 mt-1`)

**Step 1 : Modifier les lignes concernées dans `chat.js`**

Ligne ~23 — querySelector `.conv-message-row` :
```
.querySelectorAll('.ss-conv-message-row')
```

Ligne ~56 — classList.remove :
```
pendingNode.classList.remove('ss-conv-message-pending');
```

Ligne ~57 — querySelector `.conv-bubble-time` :
```
const timeNode = pendingNode.querySelector('.ss-conv-bubble-time');
```

Lignes ~137-152 — remplacer entièrement `renderMessage` :
```
function renderMessage({ messageId, content, isMine, createdAt, pending = false }) {
    const row = document.createElement('div');
    row.className = [
      'ss-conv-message-row',
      isMine ? 'ss-conv-message-row--mine' : 'ss-conv-message-row--theirs',
      pending ? 'ss-conv-message-pending' : '',
    ].filter(Boolean).join(' ');
    if (messageId) row.dataset.messageId = String(messageId);

    const bubble = document.createElement('div');
    bubble.className = 'ss-conv-bubble ' + (isMine ? 'ss-conv-bubble--mine' : 'ss-conv-bubble--theirs');

    const text = document.createElement('p');
    text.className = 'ss-conv-bubble-text';
    text.textContent = content;

    const time = document.createElement('p');
    time.className = 'ss-conv-bubble-time';
    time.textContent = formatTime(createdAt);

    bubble.appendChild(text);
    bubble.appendChild(time);
    row.appendChild(bubble);

    messagesContainer.appendChild(row);
    scrollToBottom();
    return row;
  }
```

Supprimer la ligne `row.querySelector('.conv-bubble-text').textContent = content;` (devenue inutile).

**Step 2 : Vérifier qu'aucun ancien sélecteur `conv-` (sans `ss-`) ne subsiste**

```bash
grep -n "\"conv-\|'conv-\|\`conv-" public/js/chat.js
```

Expected: aucune sortie (0 résultats).

**Step 3 : Vérifier que les nouveaux sélecteurs sont présents**

```bash
grep -c "ss-conv-" public/js/chat.js
```

Expected: nombre >= 8

**Step 4 : Commit**

```bash
git add public/js/chat.js
git commit -m "feat: chat.js — sélecteurs conv- vers ss-conv-, refactor renderMessage sans innerHTML"
```

---

## Vérification finale

```bash
# Aucun résidu Bulma dans conversation.ejs
grep -c "columns\|column is-\|is-flex\|has-addons\|is-medium\|is-size-7" views/pages/conversation.ejs

# Aucun résidu conv- (sans ss-) dans les fichiers migrés
grep -rn "\.conv-\b" public/css/messages.css public/js/chat.js views/pages/conversation.ejs

# Section ss-msg- toujours présente
grep -c "ss-msg-" public/css/messages.css
```

Expected pour les deux premiers : 0. Pour le dernier : >= 10.
