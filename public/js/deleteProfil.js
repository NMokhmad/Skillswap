const deleteBtn = document.getElementById('deleteBtn');
const deleteConfirmation = document.getElementById('delete-confirmation');
const cancelDelete = document.getElementById('cancelDelete');
const closeModal = document.getElementById('closeModal');

// Ouvrir la modale
deleteBtn.addEventListener('click', () => {
    deleteConfirmation.classList.add('ss-profil-modal--active');
});

// Fermer la modale - bouton annuler
cancelDelete.addEventListener('click', () => {
    deleteConfirmation.classList.remove('ss-profil-modal--active');
});

// Fermer la modale - croix
if (closeModal) {
    closeModal.addEventListener('click', () => {
        deleteConfirmation.classList.remove('ss-profil-modal--active');
    });
}

// Fermer la modale - clic sur le fond
const modalBackground = deleteConfirmation.querySelector('.ss-profil-modal-backdrop');
if (modalBackground) {
    modalBackground.addEventListener('click', () => {
        deleteConfirmation.classList.remove('ss-profil-modal--active');
    });
}
