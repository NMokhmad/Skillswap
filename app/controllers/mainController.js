import { Op } from 'sequelize';
import { User, Skill, Review } from '../models/index.js';
import { sequelize } from '../database.js';
import { addAverageRating } from '../helpers/rating.js';

const mainController = {
  async renderHomePage(req, res) {
    const title = "Accueil";
    const cssFile = "homepage";

    try {
      const skills = await Skill.findAll();

      // Récupérer les 3 meilleurs utilisateurs directement en SQL
      // Au lieu de charger TOUS les users en mémoire pour trier en JS
      const topUsers = await User.findAll({
        attributes: {
          include: [
            [sequelize.fn('COALESCE', sequelize.fn('AVG', sequelize.col('received_reviews.rate')), 0), 'avg_reviews']
          ]
        },
        include: [{
          model: Review,
          as: 'received_reviews',
          attributes: []
        }],
        group: ['User.id'],
        order: [[sequelize.literal('avg_reviews'), 'DESC']],
        limit: 3,
        subQuery: false
      });

      // Arrondir la moyenne pour l'affichage
      topUsers.forEach(user => {
        user.avg_reviews = Math.round(parseFloat(user.getDataValue('avg_reviews')) || 0);
      });

      res.render("homepage", { topUsers, skills, title, cssFile });
    } catch (error) {
      console.error("Erreur renderHomePage:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  renderHelpPage(req, res) {
    const title = "Aide";
    const cssFile = "help_page";
    res.render("help_page", { title, cssFile });
  },

  async searchPage(req, res) {
    const title = "Recherche";
    const cssFile = "search";

    try {
      const { q, skill } = req.query;
      const allSkills = await Skill.findAll();

      const userWhere = {};
      const skillInclude = {
        model: Skill,
        as: 'skills'
      };

      if (skill) {
        skillInclude.where = { id: parseInt(skill) };
      }

      if (q && q.trim()) {
        const searchTerm = `%${q.trim()}%`;
        userWhere[Op.or] = [
          { firstname: { [Op.iLike]: searchTerm } },
          { lastname: { [Op.iLike]: searchTerm } }
        ];
      }

      const users = await User.findAll({
        where: userWhere,
        include: [
          skillInclude,
          { model: Review, as: 'received_reviews' }
        ]
      });

      // Si on filtre par compétence, recharger toutes les compétences de chaque user
      let usersWithAllSkills = users;
      if (skill) {
        const userIds = users.map(u => u.id);
        usersWithAllSkills = await User.findAll({
          where: { id: { [Op.in]: userIds } },
          include: [
            { model: Skill, as: 'skills' },
            { model: Review, as: 'received_reviews' }
          ]
        });
      }

      const usersRated = addAverageRating(usersWithAllSkills);

      res.render("search", {
        users: usersRated,
        skills: allSkills,
        query: q || '',
        selectedSkill: skill || '',
        title,
        cssFile
      });
    } catch (error) {
      console.error("Erreur searchPage:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  // Route protégée par verifyJWT → req.user est garanti
  async renderProfilePage(req, res) {
    const scriptFile = "editProfil";
    const cssFile = "myProfil";
    const title = "Profil";

    try {
      // Charger le profil complet depuis la BDD (le JWT ne contient que id/email/firstname/lastname)
      const user = await User.findByPk(req.user.id, {
        include: [{ model: Skill, as: 'skills' }]
      });

      if (!user) {
        return res.redirect('/login');
      }

      res.render("myProfil", { user, title, cssFile, scriptFile });
    } catch (error) {
      console.error("Erreur renderProfilePage:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  // Route protégée par verifyJWT → req.user est garanti
  async renderOnboardingPage(req, res) {
    const cssFile = "onboarding";
    const title = "Onboarding";

    try {
      const skills = await Skill.findAll();

      // req.user.id vient du JWT, on charge le profil complet depuis la BDD
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.redirect('/register');
      }

      res.render('onboarding', { user, skills, title, cssFile });
    } catch (error) {
      console.error("Erreur renderOnboardingPage:", error);
      res.status(500).send('Erreur lors du chargement de la page');
    }
  },

  // Route protégée par verifyJWT → req.user est garanti
  async completeOnboarding(req, res) {
    try {
      // L'ID vient du JWT vérifié, impossible à forger
      const userId = req.user.id;

      const { bio, skills, new_skill } = req.body;

      // Mettre à jour la bio si fournie
      if (bio && bio.trim()) {
        await User.update({ bio: bio.trim() }, { where: { id: userId } });
      }

      // Gérer l'upload de l'avatar
      if (req.file) {
        const avatarPath = `/uploads/avatars/${req.file.filename}`;
        await User.update({ image: avatarPath }, { where: { id: userId } });
      }

      // Associer les compétences sélectionnées via la table de jonction
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];

        for (const skillId of skillsArray) {
          await sequelize.models.user_has_skill.findOrCreate({
            where: { user_id: userId, skill_id: parseInt(skillId) },
            defaults: { user_id: userId, skill_id: parseInt(skillId) }
          });
        }
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
          icon: 'fa-lightbulb'
        });
      }

      res.redirect('/');
    } catch (error) {
      console.error("Erreur completeOnboarding:", error);
      res.status(500).send('Erreur lors de la mise à jour du profil');
    }
  }
};

export default mainController;
