// Connexion Socket.IO + notifications toast en temps réel
(function () {
  // Ne connecter que si l'utilisateur est authentifié (badge notif présent)
  if (!document.querySelector('.notif-badge')) return;

  // Vérifier que Socket.IO est chargé
  if (typeof io === 'undefined') return;

  const socket = io({ withCredentials: true });

  // Écouter les notifications en temps réel
  socket.on('notification', (data) => {
    // Mettre à jour le badge
    updateNotifBadge(1);

    // Afficher un toast
    showToast(data);
  });

  // ─── Badge ───
  function updateNotifBadge(increment) {
    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(badge => {
      const current = parseInt(badge.textContent) || 0;
      const newCount = current + increment;
      if (newCount > 0) {
        badge.textContent = newCount > 99 ? '99+' : newCount;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  // ─── Toast ───
  function showToast(data) {
    // Créer le conteneur de toasts s'il n'existe pas
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;display:flex;flex-direction:column-reverse;gap:0.75rem;max-width:380px;';
      document.body.appendChild(container);
    }

    // Icône selon le type
    const iconMap = {
      message: 'fa-envelope',
      review: 'fa-star',
      follow: 'fa-user-plus',
    };
    const icon = iconMap[data.type] || 'fa-bell';

    // Couleur selon le type
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

    // Clic sur le toast → naviguer vers l'action
    toast.addEventListener('click', (e) => {
      if (e.target.classList.contains('toast-close')) {
        removeToast(toast);
        return;
      }
      if (data.actionUrl) {
        window.location.href = data.actionUrl;
      } else {
        window.location.href = '/notifications';
      }
    });

    container.appendChild(toast);

    // Auto-dismiss après 5 secondes
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

  // ─── Animation CSS ───
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastSlideIn {
      from { opacity: 0; transform: translateX(100%); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
})();
