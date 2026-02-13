import { User } from '../models/User.js';
import { Skill, Review } from '../models/index.js';

const talentController={
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
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (userInfo) {
        followedUser = await User.findByPk(userInfo.id, {
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

      // Calculer la moyenne des avis
      const reviews = profils.received_reviews || [];
      const totalRate = reviews.reduce((sum, r) => sum + r.rate, 0);
      const averageRating = reviews.length ? totalRate / reviews.length : 0;

      // Vérifier si l'utilisateur connecté suit ce profil
      let isFollowing = false;
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (userInfo) {
        isFollowing = profils.followers.some(f => f.id === userInfo.id);
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
