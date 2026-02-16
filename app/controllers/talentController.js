import { User } from '../models/User.js';
import { Skill, Review } from '../models/index.js';
import { addAverageRating } from '../helpers/rating.js';

const talentController = {
  // Route publique avec optionalJWT → req.user peut être null
  async renderTalentsPage(req, res) {
    const title = "Talents";
    const cssFile = "talents";

    try {
      const skills = await Skill.findAll();

      const users = await User.findAll({
        include: [
          { model: Skill, as: 'skills' },
          { model: Review, as: 'received_reviews' }
        ]
      });

      const usersRated = addAverageRating(users);

      // Récupère les utilisateurs suivis, si connecté
      let followedUser = null;
      if (req.user) {
        // req.user vient du JWT vérifié par optionalJWT
        followedUser = await User.findByPk(req.user.id, {
          include: 'followed'
        });
      }

      res.render("talents", {
        skills,
        users: usersRated,
        title,
        cssFile,
        followedUser
      });

    } catch (error) {
      console.error("Erreur lors du rendu de la page des talents :", error);
      res.status(500).send("Erreur serveur");
    }
  },

  // Route publique avec optionalJWT → req.user peut être null
  async renderTalentPage(req, res) {
    const talentId = req.params.id;
    const cssFile = "talent";

    try {
      const skills = await Skill.findAll();

      const profils = await User.findByPk(talentId, {
        include: [
          { model: Skill, as: 'skills' },
          {
            model: Review,
            as: 'received_reviews',
            include: [{ model: User, as: 'reviewer' }]
          },
          { model: User, as: 'followers' }
        ]
      });

      if (!profils) {
        return res.status(404).render("404", { title: "Utilisateur introuvable", cssFile: "404" });
      }

      const reviews = profils.received_reviews || [];
      const totalRate = reviews.reduce((sum, r) => sum + r.rate, 0);
      const averageRating = reviews.length ? totalRate / reviews.length : 0;

      // Vérifier si l'utilisateur connecté suit ce profil
      let isFollowing = false;
      if (req.user) {
        // req.user vient du JWT vérifié par optionalJWT
        isFollowing = profils.followers.some(f => f.id === req.user.id);
      }

      const title = `Talents | ${profils.firstname}`;

      res.render("talent", {
        skills,
        profils,
        reviews,
        averageRating,
        reviewCount: reviews.length,
        followerCount: profils.followers.length,
        isFollowing,
        title,
        cssFile
      });
    } catch (error) {
      console.error("Erreur lors du rendu de la page talent :", error);
      res.status(500).send("Erreur serveur");
    }
  },
};

export default talentController;
