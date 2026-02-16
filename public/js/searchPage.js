//mobile menu
const burgerIcon = document.querySelector('#burger');
const navbarMenu = document.querySelector('#nav-links');

burgerIcon.addEventListener('click', (e) => {
  e.preventDefault();
  navbarMenu.classList.toggle('is-active');
  burgerIcon.classList.toggle('is-active');
});