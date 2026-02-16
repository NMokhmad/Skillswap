document.addEventListener("DOMContentLoaded", () => {
  // Sélectionner tous les boutons + de chaque question
  const buttons = document.querySelectorAll(".question-header .toggle-btn");
  
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      // Récupérer l'ID de la réponse cible via l'attribut data-target
      const targetId = button.getAttribute("data-target");
      const answer = document.getElementById(targetId);
  
      // Toggle pour afficher/masquer la réponse
      answer.classList.toggle("is-hidden");
  
      // Changer le texte du bouton en fonction de l'état de la réponse
      button.textContent = answer.classList.contains("is-hidden") ? "+" : "-";
    });
  });
});
  
  