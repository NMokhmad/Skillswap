import { Review, User, Skill } from '../models/index.js';

const reviewController = {
  async createReview(req, res) {
    try {
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (!userInfo || !userInfo.id) {
        return res.status(401).json({ error: 'Vous devez être connecté' });
      }

      const reviewedId = parseInt(req.params.userId);
      const reviewerId = userInfo.id;

      if (reviewerId === reviewedId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas vous évaluer vous-même' });
      }

      const { rate, content, skill_id } = req.body;

      if (!rate || !skill_id) {
        return res.status(400).json({ error: 'La note et la compétence sont obligatoires' });
      }

      const parsedRate = parseInt(rate);
      if (parsedRate < 1 || parsedRate > 5) {
        return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
      }

      // Vérifier que l'utilisateur évalué existe
      const reviewed = await User.findByPk(reviewedId);
      if (!reviewed) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      // Vérifier que la compétence existe
      const skill = await Skill.findByPk(parseInt(skill_id));
      if (!skill) {
        return res.status(404).json({ error: 'Compétence introuvable' });
      }

      // Vérifier si un avis existe déjà pour cette combinaison
      const existing = await Review.findOne({
        where: { reviewer_id: reviewerId, reviewed_id: reviewedId, skill_id: parseInt(skill_id) }
      });

      if (existing) {
        // Mettre à jour l'avis existant
        await existing.update({ rate: parsedRate, content: content || '' });
        return res.redirect(`/talents/${reviewedId}`);
      }

      await Review.create({
        rate: parsedRate,
        content: content || '',
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        skill_id: parseInt(skill_id)
      });

      res.redirect(`/talents/${reviewedId}`);
    } catch (error) {
      console.error('Erreur createReview:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

export default reviewController;
