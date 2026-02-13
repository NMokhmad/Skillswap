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

  // Dropdown utilisateur - toggle au clic
  const userDropdown = document.querySelector('#userDropdown');
  const userToggle = document.querySelector('#userDropdownToggle');

  if (userDropdown && userToggle) {
    userToggle.addEventListener('click', (e) => {
      e.preventDefault();
      userDropdown.classList.toggle('is-active');
    });

    // Fermer le dropdown quand on clique ailleurs
    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target)) {
        userDropdown.classList.remove('is-active');
      }
    });
  }
});
