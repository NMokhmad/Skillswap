import { Review, User, Skill } from '../models/index.js';
import { createNotification } from '../helpers/notificationHelper.js';

const reviewController = {
  // Route protégée par verifyJWT → req.user est garanti
  async createReview(req, res) {
    try {
      const reviewedId = parseInt(req.params.userId);
      const reviewerId = req.user.id; // Vient du JWT vérifié

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

      const reviewed = await User.findByPk(reviewedId);
      if (!reviewed) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      const skill = await Skill.findByPk(parseInt(skill_id));
      if (!skill) {
        return res.status(404).json({ error: 'Compétence introuvable' });
      }

      const existing = await Review.findOne({
        where: { reviewer_id: reviewerId, reviewed_id: reviewedId, skill_id: parseInt(skill_id) }
      });

      if (existing) {
        await existing.update({ rate: parsedRate, content: content || '' });
        return res.redirect(`/talents/${reviewedId}`);
      }

      const review = await Review.create({
        rate: parsedRate,
        content: content || '',
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        skill_id: parseInt(skill_id)
      });

      // Notification à l'utilisateur évalué
      const reviewer = await User.findByPk(reviewerId);
      await createNotification({
        userId: reviewedId,
        type: 'review',
        content: `${reviewer.firstname} vous a donné un avis (${parsedRate}/5) en ${skill.label}`,
        relatedEntityType: 'review',
        relatedEntityId: review.id,
        actionUrl: `/talents/${reviewedId}`,
      });

      res.redirect(`/talents/${reviewedId}`);
    } catch (error) {
      console.error('Erreur createReview:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

export default reviewController;
