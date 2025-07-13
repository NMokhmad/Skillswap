document.addEventListener("DOMContentLoaded", function () {
  const themeToggle = document.getElementById("button_theme");
  const html = document.getElementById("html");
  
  if (localStorage.getItem("theme") === "dark") {
    html.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Mode clair";
  }
  
  themeToggle.addEventListener("click", function () {
    if (html.classList.contains("dark-mode")) {
      html.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙 Mode sombre";
    } else {
      html.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️ Mode clair";
    }
  });
});

