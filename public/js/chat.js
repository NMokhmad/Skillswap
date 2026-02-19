(function () {
  const page = document.getElementById('conversation-page');
  if (!page) return;

  const currentUserId = Number.parseInt(page.dataset.currentUserId, 10);
  const otherUserId = Number.parseInt(page.dataset.otherUserId, 10);
  const messagesContainer = document.getElementById('messages-container');
  const typingIndicator = document.getElementById('typing-indicator');
  const form = document.getElementById('message-form');
  const input = document.getElementById('message-input');

  if (!currentUserId || !otherUserId || !messagesContainer || !form || !input) return;

  const socket = window.skillSwapSocket || (typeof io !== 'undefined' ? io({
    withCredentials: true,
    transports: ['websocket'],
  }) : null);
  if (!socket) return;
  window.skillSwapSocket = socket;

  const pendingByClientId = new Map();
  const renderedMessageIds = new Set(
    Array.from(messagesContainer.querySelectorAll('.conv-message-row'))
      .map((node) => Number.parseInt(node.dataset.messageId, 10))
      .filter((id) => Number.isInteger(id))
  );

  let typingTimeout = null;

  socket.emit('conversation:join', { otherUserId });
  socket.emit('message:read', { otherUserId });
  if (typeof window.refreshMessageBadge === 'function') {
    window.refreshMessageBadge();
  }

  window.addEventListener('beforeunload', () => {
    socket.emit('conversation:leave', { otherUserId });
  });

  socket.on('message:new', (message) => {
    const senderId = Number(message.senderId);
    const receiverId = Number(message.receiverId);

    const isConversationMessage =
      (senderId === currentUserId && receiverId === otherUserId) ||
      (senderId === otherUserId && receiverId === currentUserId);

    if (!isConversationMessage) return;

    const messageId = Number(message.id);
    const clientMessageId = message.clientMessageId || null;

    if (clientMessageId && pendingByClientId.has(clientMessageId)) {
      const pendingNode = pendingByClientId.get(clientMessageId);
      pendingNode.dataset.messageId = messageId;
      pendingNode.classList.remove('conv-message-pending');
      const timeNode = pendingNode.querySelector('.conv-bubble-time');
      if (timeNode) timeNode.textContent = formatTime(message.createdAt);
      pendingByClientId.delete(clientMessageId);
      renderedMessageIds.add(messageId);
    } else if (!renderedMessageIds.has(messageId)) {
      renderMessage({
        messageId,
        content: message.content,
        isMine: senderId === currentUserId,
        createdAt: message.createdAt,
      });
      renderedMessageIds.add(messageId);
    }

    if (senderId === otherUserId) {
      hideTyping();
      socket.emit('message:read', { otherUserId });
      if (typeof window.refreshMessageBadge === 'function') {
        window.refreshMessageBadge();
      }
    }
  });

  socket.on('message:typing', (payload) => {
    if (Number(payload.senderId) !== otherUserId) return;
    if (Number(payload.receiverId) !== currentUserId) return;

    if (payload.isTyping) {
      showTyping();
    } else {
      hideTyping();
    }
  });

  form.addEventListener('submit', (event) => {
    const content = input.value.trim();
    if (!content) {
      event.preventDefault();
      return;
    }

    if (!socket.connected) {
      return;
    }

    event.preventDefault();

    const clientMessageId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const node = renderMessage({
      messageId: null,
      content,
      isMine: true,
      createdAt: new Date().toISOString(),
      pending: true,
    });
    pendingByClientId.set(clientMessageId, node);

    socket.emit('message:send', {
      receiverId: otherUserId,
      content,
      clientMessageId,
    });

    socket.emit('message:typing', { receiverId: otherUserId, isTyping: false });
    input.value = '';
    input.focus();
  });

  input.addEventListener('input', () => {
    socket.emit('message:typing', { receiverId: otherUserId, isTyping: true });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit('message:typing', { receiverId: otherUserId, isTyping: false });
    }, 900);
  });

  input.addEventListener('blur', () => {
    socket.emit('message:typing', { receiverId: otherUserId, isTyping: false });
  });

  function renderMessage({ messageId, content, isMine, createdAt, pending = false }) {
    const row = document.createElement('div');
    row.className = `mb-4 conv-message-row ${isMine ? 'conv-message-row-mine' : 'conv-message-row-theirs'} ${pending ? 'conv-message-pending' : ''}`;
    if (messageId) row.dataset.messageId = String(messageId);

    row.innerHTML = `
      <div class="conv-bubble ${isMine ? 'conv-bubble-mine' : 'conv-bubble-theirs'}">
        <p class="conv-bubble-text"></p>
        <p class="is-size-7 mt-1 conv-bubble-time">${formatTime(createdAt)}</p>
      </div>
    `;
    row.querySelector('.conv-bubble-text').textContent = content;

    messagesContainer.appendChild(row);
    scrollToBottom();
    return row;
  }

  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    typingIndicator.hidden = false;
  }

  function hideTyping() {
    typingIndicator.hidden = true;
  }

  function formatTime(dateValue) {
    const date = new Date(dateValue);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
})();
