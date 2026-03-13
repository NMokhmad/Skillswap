import { User, Skill, Review } from '../models/index.js';
import { addAverageRating } from '../helpers/rating.js';

const normalizeImage = (image) => image ? image.replace(/^\/uploads\/avatars\//, '') : null;

const talentController = {

  async apiGetTalents(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        attributes: ['id', 'firstname', 'lastname', 'image', 'city', 'interest'],
        include: [
          { model: Skill, as: 'skills', attributes: ['id', 'label', 'slug'], through: { attributes: [] } },
          { model: Review, as: 'received_reviews', attributes: ['rate'] },
        ],
        distinct: true,
        limit,
        offset,
        order: [['id', 'DESC']],
      });

      const results = users.map(u => {
        const reviews = u.received_reviews || [];
        const avg = reviews.length ? reviews.reduce((s, r) => s + r.rate, 0) / reviews.length : 0;
        return { id: u.id, firstname: u.firstname, lastname: u.lastname, image: normalizeImage(u.image), city: u.city, interest: u.interest, skills: u.skills, averageRating: Math.round(avg * 10) / 10, reviewCount: reviews.length };
      });

      return res.json({ page, limit, total: count, totalPages: Math.ceil(count / limit), results });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async apiGetTalent(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: Skill, as: 'skills', attributes: ['id', 'label', 'slug'], through: { attributes: [] } },
          { model: Review, as: 'received_reviews', include: [{ model: User, as: 'reviewer', attributes: ['id', 'firstname', 'lastname', 'image'] }] },
          { model: User, as: 'followers', attributes: ['id'] },
        ],
      });
      if (!user) return res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Utilisateur introuvable' });

      const reviews = user.received_reviews || [];
      const avg = reviews.length ? reviews.reduce((s, r) => s + r.rate, 0) / reviews.length : 0;
      const isFollowing = req.user ? user.followers.some(f => f.id === req.user.id) : false;

      return res.json({
        talent: {
          id: user.id, firstname: user.firstname, lastname: user.lastname,
          bio: user.bio, city: user.city, image: normalizeImage(user.image), interest: user.interest,
          skills: user.skills,
          reviews: reviews.map(r => ({ id: r.id, rate: r.rate, comment: r.comment, created_at: r.created_at, reviewer: { ...r.reviewer.toJSON(), image: normalizeImage(r.reviewer?.image) } })),
          averageRating: Math.round(avg * 10) / 10,
          reviewCount: reviews.length,
          followerCount: user.followers.length,
          isFollowing,
        }
      });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },
  // Route publique avec optionalJWT → req.user peut être null
  async renderTalentsPage(req, res) {
    const title = "Talents";
    const cssFile = "talents";

    try {
      const skills = await Skill.findAll();

      // Pagination : 12 talents par page
      const page = parseInt(req.query.page) || 1;
      const limit = 12;
      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        include: [
          { model: Skill, as: 'skills' },
          { model: Review, as: 'received_reviews' }
        ],
        distinct: true, // Évite le count faussé par les jointures
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      const usersRated = addAverageRating(users);
      const totalPages = Math.ceil(count / limit);

      // Récupère les utilisateurs suivis, si connecté
      let followedUser = null;
      if (req.user) {
        followedUser = await User.findByPk(req.user.id, {
          include: 'followed'
        });
      }

      res.render("talents", {
        skills,
        users: usersRated,
        title,
        cssFile,
        followedUser,
        currentPage: page,
        totalPages,
        totalUsers: count,
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
