const burgerIcon = document.querySelector('#burger');
const navbarMenu = document.querySelector('#navbarMenu');

burgerIcon.addEventListener('click', (e) => {
  e.preventDefault();
  navbarMenu.classList.toggle('is-active');
});