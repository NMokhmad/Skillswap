document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.review-star');
  const rateInput = document.getElementById('review-rate');

  if (!stars.length || !rateInput) return;

  stars.forEach(star => {
    star.addEventListener('click', () => {
      const value = parseInt(star.dataset.value);
      rateInput.value = value;

      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        const icon = s.querySelector('i');
        if (v <= value) {
          icon.className = 'fas fa-star';
          s.style.color = '#ffd700';
        } else {
          icon.className = 'far fa-star';
          s.style.color = '#ccc';
        }
      });
    });

    star.addEventListener('mouseenter', () => {
      const value = parseInt(star.dataset.value);
      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        const icon = s.querySelector('i');
        if (v <= value) {
          icon.className = 'fas fa-star';
          s.style.color = '#ffd700';
        }
      });
    });

    star.addEventListener('mouseleave', () => {
      const currentValue = parseInt(rateInput.value) || 0;
      stars.forEach(s => {
        const v = parseInt(s.dataset.value);
        const icon = s.querySelector('i');
        if (v <= currentValue) {
          icon.className = 'fas fa-star';
          s.style.color = '#ffd700';
        } else {
          icon.className = 'far fa-star';
          s.style.color = '#ccc';
        }
      });
    });
  });
});
