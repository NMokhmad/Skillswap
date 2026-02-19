// Connexion Socket.IO + notifications/messages temps reel
(function () {
  if (typeof io === 'undefined') return;
  if (!window.currentUserId) return;

  const socket = window.skillSwapSocket || io({
    withCredentials: true,
    transports: ['websocket'],
  });
  window.skillSwapSocket = socket;

  if (window.__skillSwapSocketInitialized) return;
  window.__skillSwapSocketInitialized = true;

  socket.on('notification', (data) => {
    if (typeof window.refreshNotificationBadge === 'function') {
      window.refreshNotificationBadge();
    }
    if (typeof window.refreshNotificationDropdown === 'function') {
      window.refreshNotificationDropdown();
    }
    showToast(data);
  });

  socket.on('message:new', (data) => {
    if (Number(data.receiverId) !== Number(window.currentUserId)) return;
    if (typeof window.refreshMessageBadge === 'function') {
      window.refreshMessageBadge();
    }
  });

  socket.on('messages:read:ack', () => {
    if (typeof window.refreshMessageBadge === 'function') {
      window.refreshMessageBadge();
    }
  });

  function showToast(data) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column-reverse;gap:0.75rem;max-width:380px;';
      document.body.appendChild(container);
    }

    const iconMap = {
      message: 'fa-envelope',
      review: 'fa-star',
      follow: 'fa-user-plus',
    };
    const icon = iconMap[data.type] || 'fa-bell';

    const colorMap = {
      message: '#6b7db3',
      review: '#ffd700',
      follow: '#ff6b9d',
    };
    const color = colorMap[data.type] || '#7d6b93';

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: #30293d;
      color: white;
      padding: 1rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      border-left: 4px solid ${color};
      display: flex;
      align-items: center;
      gap: 0.75rem;
      animation: toastSlideIn 0.4s ease;
      cursor: pointer;
      transition: opacity 0.3s ease, transform 0.3s ease;
    `;

    toast.innerHTML = `
      <span style="color:${color};font-size:1.2rem;"><i class="fa-solid ${icon}"></i></span>
      <span style="flex:1;font-size:0.9rem;line-height:1.3;">${escapeHtml(data.content)}</span>
      <span style="color:#7d6b93;font-size:0.8rem;cursor:pointer;" class="toast-close">&times;</span>
    `;

    toast.addEventListener('click', (e) => {
      if (e.target.classList.contains('toast-close')) {
        removeToast(toast);
        return;
      }
      window.location.href = data.actionUrl || '/notifications';
    });

    container.appendChild(toast);
    setTimeout(() => removeToast(toast), 5000);
  }

  function removeToast(toast) {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
})();
