import { Skill, User } from '../models/index.js';

const normalizeImage = (image) => image ? image.replace(/^\/uploads\/avatars\//, '') : null;

const skillController = {

  async apiGetSkills(req, res) {
    try {
      const skills = await Skill.findAll({
        attributes: ['id', 'label', 'slug', 'icon'],
        include: [{ model: User, as: 'users', attributes: ['id'], through: { attributes: [] } }],
      });
      const totalUsers = await User.count();
      return res.json({
        skills: skills.map(s => ({ id: s.id, label: s.label, slug: s.slug, icon: s.icon, userCount: s.users.length })),
        totalUsers,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  async apiGetSkill(req, res) {
    try {
      const skill = await Skill.findOne({
        where: { slug: req.params.slug },
        include: [{ model: User, as: 'users', attributes: ['id', 'firstname', 'lastname', 'image', 'bio'], through: { attributes: [] } }],
      });
      if (!skill) return res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Compétence introuvable' });
      return res.json({
        skill: {
          id: skill.id, label: skill.label, slug: skill.slug, icon: skill.icon,
          users: skill.users.map(u => ({ ...u.toJSON(), image: normalizeImage(u.image) })),
        }
      });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },
  // Route publique avec optionalJWT → req.user peut être null
  async renderSkillsPage(req, res) {
    const title = "Skills";
    const cssFile = "skills";

    try {
      // Inclure les users pour compter le nombre de talents par skill
      const skills = await Skill.findAll({ include: 'users' });
      const totalUsers = await User.count();
      res.render("skills", { skills, title, cssFile, totalUsers });
    } catch (error) {
      console.error("Erreur renderSkillsPage:", error);
      res.status(500).send("Erreur serveur");
    }
  },

  // Route publique avec optionalJWT → req.user peut être null
  async renderSkillPage(req, res) {
    const skillSlug = req.params.slug;
    const cssFile = "skill";

    try {
      const skills = await Skill.findAll();

      const skill = await Skill.findOne({
        where: { slug: skillSlug },
        include: 'users'
      });

      if (!skill) {
        return res.status(404).render("404", { title: "Compétence introuvable", cssFile: "404" });
      }

      const title = `Skills | ${skill.label}`;
      res.render("skill", { skills, skill, title, cssFile });
    } catch (error) {
      console.error("Erreur renderSkillPage:", error);
      res.status(500).send("Erreur serveur");
    }
  },
};

export default skillController;
