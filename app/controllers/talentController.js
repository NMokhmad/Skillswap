import { User } from '../models/User.js';
import { Skill } from '../models/index.js';
import { Review } from '../models/Review.js';

const talentController={
  async renderTalentsPage(req, res) {
    const title = "Talents";
    const cssFile = "talents";
  
    try {
      // Récupère toutes les compétences disponibles
      const skills = await Skill.findAll();
  
      // Récupère tous les utilisateurs avec leurs compétences et avis reçus
      const users = await User.findAll({
        include: [
          { model: Skill, as: 'skills' },
          { model: Review, as: 'received_reviews' }
        ]
      });
  
      // Calcule la moyenne des notes pour chaque utilisateur
      const usersRated = users.map(user => {
        const reviews = user.received_reviews || [];
        const total = reviews.reduce((sum, r) => sum + r.rate, 0);
        const average = reviews.length ? total / reviews.length : 0;
  
        return {
          ...user.toJSON(),
          averageRating: average
        };
      });
  
      // Récupère les utilisateurs suivis, si connecté
      let followedUser = null;
      if (req.cookies.user) {
        followedUser = await User.findByPk(req.cookies.user.id, {
          include: 'followed'
        });
      }
  
      res.render("talents", {
        user: req.cookies.user,
        skills,
        users: usersRated, // Tu utilises uniquement les users avec leur moyenne
        title,
        cssFile,
        followedUser
      });
  
    } catch (error) {
      console.error("Erreur lors du rendu de la page des talents :", error);
      res.status(500).send("Erreur serveur");
    }
  },

  async renderTalentPage(req,res){
    const talentId = req.params.id;

    const cssFile = "talent";
    
    // Je récupère les compétences stockées en base de données
    const skills = await Skill.findAll();
    
    const profils = await User.findByPk(talentId, {
      include: 'skills'
    });

    const title = `Talents | ${profils.firstname}`;
    console.log(title);

    res.render("talent",{skills, profils, title, cssFile } );
  },
};

export default talentController;
