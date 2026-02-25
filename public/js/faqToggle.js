document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".ss-help-faq-header .ss-help-faq-toggle");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const answer = document.getElementById(targetId);

      answer.classList.toggle("ss-hidden");

      const isOpen = !answer.classList.contains("ss-hidden");
      button.textContent = isOpen ? "-" : "+";
      button.classList.toggle("active", isOpen);
    });
  });
});
