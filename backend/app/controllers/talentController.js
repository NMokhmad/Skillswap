import { User } from '../models/User.js';
import { Skill } from '../models/index.js';
import { Review } from '../models/Review.js';

const talentController = {
  // 📌 Liste de tous les talents
  async getAllTalents(req, res) {
    try {
      // Récupérer toutes les compétences
      const skills = await Skill.findAll();

      // Récupérer tous les utilisateurs avec leurs compétences et avis
      const users = await User.findAll({
        include: [
          { model: Skill, as: 'skills' },
          { model: Review, as: 'received_reviews' }
        ]
      });

      // Calcul de la moyenne des notes
      const usersRated = users.map(user => {
        const reviews = user.received_reviews || [];
        const total = reviews.reduce((sum, r) => sum + r.rate, 0);
        const average = reviews.length ? total / reviews.length : 0;

        return {
          ...user.toJSON(),
          averageRating: Number(average.toFixed(2))
        };
      });

      // Récupérer les talents suivis (si connecté)
      let followedUser = null;
      if (req.cookies.userInfo) {
        const userInfo = JSON.parse(req.cookies.userInfo);
        followedUser = await User.findByPk(userInfo.id, {
          include: 'followed'
        });
      }

      res.json({
        success: true,
        skills,
        users: usersRated,
        followedUser
      });

    } catch (error) {
      console.error("Erreur lors de la récupération des talents :", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  },

  // 📌 Détail d’un talent
  async getTalentById(req, res) {
    try {
      const talentId = req.params.id;

      // Récupérer toutes les compétences (si besoin pour menu)
      const skills = await Skill.findAll();

      // Récupérer le talent avec ses compétences
      const profil = await User.findByPk(talentId, {
        include: 'skills'
      });

      if (!profil) {
        return res.status(404).json({ success: false, message: "Talent non trouvé" });
      }

      res.json({
        success: true,
        skills,
        profil
      });

    } catch (error) {
      console.error("Erreur lors de la récupération du talent :", error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
    }
  }
};

export default talentController;
