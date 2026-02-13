import { User, Skill, Review } from '../models/index.js';

const mainController={
  async renderHomePage(req,res){
    const title = "Accueil";
    const cssFile = "homepage";

    // Récupérer toutes les compétences
    const skills = await Skill.findAll();

    console.log(skills);

    // SELECT * FROM "user" 
    // ORDER BY RANDOM()
    // LIMIT 1

    // On récupère tous les profils
    // Récupérer tous les profils, y compris leurs compétences et évaluations reçues
    const bestUser = await User.findAll({
      include: [{
        model: Review,
        as: 'received_reviews'
      }]
    });
     
    console.log(bestUser);
    // Fonction pour calculer la moyenne des notes
    function calculateAverageRating(received_reviews) {
      if (!received_reviews || received_reviews.length === 0) return 0;
    
      const total = received_reviews.reduce((sum, review) => sum + review.dataValues.rate, 0);
      return total / received_reviews.length;
    }
    
    // Fonction pour obtenir les 3 meilleurs utilisateurs
    function getTopUsers(users) {
      users.forEach(user => {
        user.avg_reviews = calculateAverageRating(user.received_reviews);
        user.avg_reviews = Math.round(user.avg_reviews);
      });
    
      const sortedUsers = users.sort((a, b) => b.avg_reviews - a.avg_reviews);
      return sortedUsers.slice(0, 3);
    }
    
    // Obtenir les 3 meilleurs utilisateurs
    const topUsers = getTopUsers(bestUser);
    console.log(topUsers);
    
    res.render("homepage", {topUsers , skills, title, cssFile });
    
    
  },

  renderHelpPage(req,res){
    const title = "Aide";
    const cssFile = "help_page";
    res.render("help_page", { title , cssFile });
  },

  searchPage(req,res){
    res.render("searchPage");
  },

  renderProfilePage(req,res){
    const userInfo = JSON.parse(req.cookies.userInfo ||'{}');
    const userId = userInfo.id;
    if (!userId) {
      return res.status(400).send("ID utilisateur introuvable dans le cookie");
    }
    const scriptFile="editProfil";
    const cssFile="myProfile";
    const title="Profil";
    
    console.log(userInfo);

    res.render("myProfil", { user:userInfo, title, cssFile ,scriptFile });
  },
  
  async renderOnboardingPage(req, res) {
    const cssFile = "onboarding";
    const title = "Onboarding";

    try {
        // Récupérer toutes les compétences disponibles
        const skills = await Skill.findAll();
        
        // Récupérer l'utilisateur (soit depuis req.user du middleware, soit depuis le cookie)
        let user;
        if (req.user) {
            // Si tu as un middleware qui met l'user complet dans req.user
            user = req.user;
        } else {
            // Sinon, récupérer depuis le cookie userInfo
            const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
            console.log("User info from cookie:", userInfo);
            if (userInfo) {
                user = await User.findByPk(userInfo.id);
            }
        }
        
        if (!user) {
            return res.redirect('/register'); // Redirige vers la page d'inscription si l'utilisateur n'est pas trouvé
        }
        
        // Render avec tous les paramètres nécessaires
        res.render('onboarding', { 
            user, 
            skills, 
            title, 
            cssFile 
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du chargement de la page');
    }
},

async completeOnboarding(req, res) {
    try {
        console.log("Données reçues:", req.body);
        console.log("Fichier reçu:", req.file);
        
        // ✅ Récupérer userInfo depuis le cookie
        const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
        
        if (!userInfo || !userInfo.id) {
            return res.redirect('/login');
        }
        
        const userId = userInfo.id;
        console.log("ID utilisateur:", userId);
        
        const { bio, skills, new_skill } = req.body;
        
        // Mettre à jour la bio si fournie
        if (bio && bio.trim()) {
            await User.update({ bio: bio.trim() }, { where: { id: userId } });
            console.log("Bio mise à jour");
        }
        
        // Gérer l'upload de l'avatar
        if (req.file) {
            const avatarPath = `/uploads/avatars/${req.file.filename}`;
            await User.update({ avatar: avatarPath }, { where: { id: userId } });
            console.log("Avatar mis à jour:", avatarPath);
        }
        
        // Associer les compétences sélectionnées
        if (skills) {
            const skillsArray = Array.isArray(skills) ? skills : [skills];
            console.log("Compétences à ajouter:", skillsArray);
            
            for (const skillId of skillsArray) {
                await UserSkill.create({
                    user_id: userId,
                    skill_id: parseInt(skillId)
                });
            }
            console.log("Compétences associées");
        }
        
        // Créer une nouvelle compétence si proposée
        if (new_skill && new_skill.trim()) {
            const slug = new_skill.trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
                
            await Skill.create({
                label: new_skill.trim(),
                slug: slug,
                icon: 'fa-lightbulb',
                pending: true
            });
            console.log("Nouvelle compétence créée:", new_skill.trim());
        }
        
        res.redirect('/');
        
    } catch (error) {
        console.error("Erreur completeOnboarding:", error);
        res.status(500).send('Erreur lors de la mise à jour du profil');
    }
}
  
};

export default mainController;
