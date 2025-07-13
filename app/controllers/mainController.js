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
  }
  
};

export default mainController;
