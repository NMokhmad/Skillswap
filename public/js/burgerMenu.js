document.addEventListener('DOMContentLoaded', () => {
  const burgerIcon = document.querySelector('#burger');
  const navbarMenu = document.querySelector('#navbarMenu');

  if (burgerIcon && navbarMenu) {
    burgerIcon.addEventListener('click', (e) => {
      e.preventDefault();
      burgerIcon.classList.toggle('is-active');
      navbarMenu.classList.toggle('is-active');
    });
  }

  // Gestion des dropdowns utilisateur (mobile + desktop)
  const dropdowns = [
    { dropdown: document.querySelector('#userDropdownMobile'), toggle: document.querySelector('#userDropdownMobileToggle') },
    { dropdown: document.querySelector('#userDropdownDesktop'), toggle: document.querySelector('#userDropdownDesktopToggle') }
  ];

  dropdowns.forEach(({ dropdown, toggle }) => {
    if (dropdown && toggle) {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        dropdown.classList.toggle('is-active');
      });
    }
  });

  // Fermer tous les dropdowns quand on clique ailleurs
  document.addEventListener('click', (e) => {
    dropdowns.forEach(({ dropdown }) => {
      if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('is-active');
      }
    });
  });
});
