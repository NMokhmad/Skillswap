const deleteButton = document.querySelector("#deleteBtn"); 
const deleteModal = document.querySelector("#delete-confirmation");
const cancelDeleteButton = document.querySelector("#cancelDelete");

// Afficher le modal lorsque le bouton "Supprimer mon profil" est cliqué
deleteButton.addEventListener("click", function() {
  deleteModal.classList.toggle("is-hidden");
});

// Fermer le modal si l'utilisateur clique sur "Annuler"
cancelDeleteButton.addEventListener("click", function() {
  deleteModal.classList.add("is-hidden");
});