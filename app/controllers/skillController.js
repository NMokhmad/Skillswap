import { User } from '../models/User.js';
import { Skill } from '../models/index.js';

const skillController={
  async renderSkillsPage(req,res){
    const title = "Skills";
    const cssFile = "skills";

    // Je récupère les compétences stockées en base de données
    const skills = await Skill.findAll();

    const user = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
    res.render("skills", { user, skills, title, cssFile } );
  },

  async renderSkillPage(req,res){
    const skillSlug = req.params.slug;

    const cssFile = "skill";

    const skills = await Skill.findAll();
    
    // Je récupère les compétences stockées en base de données
    const skill = await Skill.findAll({
      where: {
        slug: skillSlug
      },
      include: 'users'
    });

    const title = `Skills | ${skill[0].label}`;

    const user = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
    res.render("skill",{ user, skills, skill: skill[0], title, cssFile } );
  },
};

export default skillController;
