// Éléments DOM
const form = document.getElementById('onboarding-form');
const progressBar = document.getElementById('profile-progress');
const progressText = document.getElementById('progress-text');
const completeBtn = document.getElementById('complete-btn');

const avatarInput = document.getElementById('avatar-input');
const fileName = document.getElementById('file-name');
const previewImg = document.getElementById('preview-img');
const defaultIcon = document.getElementById('default-icon');

const bioTextarea = document.getElementById('bio');
const bioCount = document.getElementById('bio-count');

const skillCheckboxes = document.querySelectorAll('.skill-checkbox');
const selectedSkillsDisplay = document.getElementById('selected-skills-display');
const selectedCount = document.getElementById('selected-count');

const skillSearch = document.getElementById('skill-search');
const skillTags = document.querySelectorAll('.skill-tag');

let stepsCompleted = 0;

// 1. Upload et prévisualisation de l'avatar
avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            defaultIcon.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        updateProgress();
    }
});

// 2. Compteur de caractères pour la bio
bioTextarea.addEventListener('input', () => {
    const length = bioTextarea.value.length;
    bioCount.textContent = length;
    updateProgress();
});

// 3. Gestion des compétences
skillCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        updateSelectedSkills();
        updateProgress();
    });
});

function updateSelectedSkills() {
    const checked = document.querySelectorAll('.skill-checkbox:checked');
    const count = checked.length;
    
    if (count > 0) {
        selectedSkillsDisplay.classList.remove('is-hidden');
        selectedCount.textContent = `${count} sélectionnée${count > 1 ? 's' : ''}`;
        completeBtn.disabled = false;
    } else {
        selectedSkillsDisplay.classList.add('is-hidden');
        completeBtn.disabled = true;
    }
}

// 4. Recherche de compétences
skillSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    
    skillTags.forEach(tag => {
        const skillName = tag.getAttribute('data-skill-name');
        const label = tag.closest('label');
        
        if (skillName.includes(searchTerm)) {
            label.style.display = '';
        } else {
            label.style.display = 'none';
        }
    });
});

// 5. Mise à jour de la barre de progression
function updateProgress() {
    stepsCompleted = 0;
    
    // Étape 1 : Avatar
    if (avatarInput.files.length > 0) stepsCompleted++;
    
    // Étape 2 : Bio
    if (bioTextarea.value.trim().length > 0) stepsCompleted++;
    
    // Étape 3 : Au moins une compétence
    const checkedSkills = document.querySelectorAll('.skill-checkbox:checked');
    if (checkedSkills.length > 0) stepsCompleted++;
    
    // Étape 4 : Nouvelle compétence (optionnel, ne compte pas)
    const newSkill = document.getElementById('new-skill');
    if (newSkill && newSkill.value.trim().length > 0) stepsCompleted++;
    
    // Mise à jour visuelle
    progressBar.value = stepsCompleted;
    progressText.textContent = `${stepsCompleted}/4 étapes`;
    
    // Changer la couleur du tag selon la progression
    if (stepsCompleted === 0) {
        progressText.style.backgroundColor = '#e07b91';
    } else if (stepsCompleted < 3) {
        progressText.style.backgroundColor = '#6b7db3';
    } else {
        progressText.style.backgroundColor = '#7d6b93';
    }
}

// 6. Validation du formulaire
form.addEventListener('submit', (e) => {
    const checkedSkills = document.querySelectorAll('.skill-checkbox:checked');
    
    if (checkedSkills.length === 0) {
        e.preventDefault();
        alert('Veuillez sélectionner au moins une compétence pour continuer.');
        return false;
    }
});

// Initialisation
updateProgress();