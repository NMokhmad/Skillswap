import { Skill } from '../models/index.js';

const skillController = {
  // 📌 Liste de toutes les compétences
  async getAllSkills(req, res) {
    try {
      const skills = await Skill.findAll();

      res.json({
        success: true,
        user: req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null,
        skills
      });

    } catch (error) {
      console.error('Erreur lors de la récupération des compétences :', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  },

  // 📌 Détail d'une compétence par slug
  async getSkillBySlug(req, res) {
    try {
      const skillSlug = req.params.slug;

      // Récupération de toutes les compétences pour un éventuel menu
      const skills = await Skill.findAll();

      // Récupération de la compétence spécifique avec ses utilisateurs associés
      const skill = await Skill.findOne({
        where: { slug: skillSlug },
        include: 'users'
      });

      if (!skill) {
        return res.status(404).json({ success: false, message: 'Compétence non trouvée' });
      }

      res.json({
        success: true,
        user: req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null,
        skills,
        skill,
        title: `Skills | ${skill.label}`
      });

    } catch (error) {
      console.error('Erreur lors de la récupération de la compétence :', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  }
};

export default skillController;
