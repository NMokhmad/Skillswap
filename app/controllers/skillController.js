import { Skill } from '../models/index.js';

const skillController = {
  // Route publique avec optionalJWT → req.user peut être null
  async renderSkillsPage(req, res) {
    const title = "Skills";
    const cssFile = "skills";

    try {
      const skills = await Skill.findAll();
      res.render("skills", { skills, title, cssFile });
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
