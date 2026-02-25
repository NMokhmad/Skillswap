        // Prévisualisation de l'avatar dans le formulaire d'édition
        const avatarEditInput = document.getElementById('avatar-edit');
        const fileNameEdit = document.getElementById('file-name-edit');
        const avatarPreviewEdit = document.getElementById('avatar-preview-edit');

        if (avatarEditInput) {
            avatarEditInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    fileNameEdit.textContent = file.name;
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        // Si c'est une image, créer un élément img
                        if (avatarPreviewEdit.tagName === 'IMG') {
                            avatarPreviewEdit.src = event.target.result;
                        } else {
                            // Remplacer le div par une image
                            const img = document.createElement('img');
                            img.id = 'avatar-preview-edit';
                            img.src = event.target.result;
                            img.style.cssText = 'width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 2px solid rgba(212,146,42,0.30);';
                            avatarPreviewEdit.parentNode.replaceChild(img, avatarPreviewEdit);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        // Compteur de caractères pour la bio
        const bioEditTextarea = document.getElementById('bio-edit');
        const bioCountEdit = document.getElementById('bio-count-edit');

        if (bioEditTextarea && bioCountEdit) {
            bioEditTextarea.addEventListener('input', () => {
                bioCountEdit.textContent = bioEditTextarea.value.length;
            });
        }