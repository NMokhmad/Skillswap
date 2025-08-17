import { User, Skill, Review } from '../models/index.js';

const mainController = {
  // 📌 Page d'accueil - API
  async getHomeData(req, res) {
    try {
      // Récupérer toutes les compétences
      const skills = await Skill.findAll();

      // Récupérer tous les profils avec leurs reviews reçues
      const allUsers = await User.findAll({
        include: [{
          model: Review,
          as: 'received_reviews'
        }]
      });

      // Fonction pour calculer la moyenne
      const calculateAverageRating = (received_reviews) => {
        if (!received_reviews || received_reviews.length === 0) return 0;
        const total = received_reviews.reduce((sum, review) => sum + review.dataValues.rate, 0);
        return Math.round(total / received_reviews.length);
      };

      // Obtenir les 3 meilleurs utilisateurs
      const topUsers = allUsers
        .map(user => ({
          ...user.toJSON(),
          avg_reviews: calculateAverageRating(user.received_reviews)
        }))
        .sort((a, b) => b.avg_reviews - a.avg_reviews)
        .slice(0, 3);

      res.json({
        success: true,
        topUsers,
        skills
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors du chargement des données d'accueil"
      });
    }
  },

  // 📌 Page profil - API
  async getProfile(req, res) {
    try {
      const userInfo = JSON.parse(req.cookies.userInfo || '{}');
      const userId = userInfo.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "ID utilisateur introuvable dans le cookie"
        });
      }

      res.json({
        success: true,
        user: userInfo
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la récupération du profil"
      });
    }
  }
};

export default mainController;

