document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-follow').forEach(btn => {
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.userId;
      const isFollowing = btn.dataset.following === 'true';

      try {
        const response = await fetch(`/follow/${userId}`, {
          method: isFollowing ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 401) {
          window.location.href = '/login';
          return;
        }

        if (response.ok) {
          btn.dataset.following = isFollowing ? 'false' : 'true';
          const icon = btn.querySelector('i');
          const label = btn.querySelector('span:last-child');

          if (isFollowing) {
            icon.className = 'fas fa-user-plus';
            label.textContent = 'Suivre';
            btn.classList.remove('is-following');
          } else {
            icon.className = 'fas fa-user-minus';
            label.textContent = 'Ne plus suivre';
            btn.classList.add('is-following');
          }
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    });
  });
});
