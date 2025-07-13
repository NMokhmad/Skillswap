const burgerMenu = document.querySelector(".burger-menu"); 
const navLinks = document.querySelector(".nav-links"); 

burgerMenu.addEventListener("click", function () { 

  navLinks.classList.toggle("active"); 
}); 
