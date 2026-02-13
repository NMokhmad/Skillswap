import { User } from '../models/index.js';
import { sequelize } from '../database.js';

const followController = {
  async follow(req, res) {
    try {
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (!userInfo || !userInfo.id) {
        return res.status(401).json({ error: 'Vous devez être connecté' });
      }

      const followedId = parseInt(req.params.id);
      const followerId = userInfo.id;

      if (followerId === followedId) {
        return res.status(400).json({ error: 'Vous ne pouvez pas vous suivre vous-même' });
      }

      const followed = await User.findByPk(followedId);
      if (!followed) {
        return res.status(404).json({ error: 'Utilisateur introuvable' });
      }

      // Vérifier si déjà suivi
      const [result, created] = await sequelize.models.user_has_follow.findOrCreate({
        where: { follower_id: followerId, followed_id: followedId },
        defaults: { follower_id: followerId, followed_id: followedId }
      });

      if (!created) {
        return res.status(409).json({ error: 'Vous suivez déjà cet utilisateur' });
      }

      return res.status(201).json({ message: 'Utilisateur suivi avec succès' });
    } catch (error) {
      console.error('Erreur follow:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  },

  async unfollow(req, res) {
    try {
      const userInfo = req.cookies.userInfo ? JSON.parse(req.cookies.userInfo) : null;
      if (!userInfo || !userInfo.id) {
        return res.status(401).json({ error: 'Vous devez être connecté' });
      }

      const followedId = parseInt(req.params.id);
      const followerId = userInfo.id;

      const deleted = await sequelize.models.user_has_follow.destroy({
        where: { follower_id: followerId, followed_id: followedId }
      });

      if (!deleted) {
        return res.status(404).json({ error: 'Vous ne suivez pas cet utilisateur' });
      }

      return res.status(200).json({ message: 'Vous ne suivez plus cet utilisateur' });
    } catch (error) {
      console.error('Erreur unfollow:', error);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
  }
};

export default followController;
