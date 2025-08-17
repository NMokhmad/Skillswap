import { User } from "../models/User.js";
import { userUpdateSchema } from "../schemas/userUpdateSchema.js";
import { Review } from "../models/Review.js";
import { Message } from "../models/Message.js";
import { sequelize } from "../database.js";
import { Notification } from "../models/Notification.js";

const profilController = {
  // 📌 Mise à jour du profil
  updateProfile: async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const inputData = req.body;

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
      }

      // Validation des données
      await userUpdateSchema.validateAsync(inputData);

      // Mise à jour
      await user.update(inputData);

      // Mise à jour du cookie avec les nouvelles infos
      res.cookie('userInfo', JSON.stringify({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      }), {
        httpOnly: false,  
        secure: true,
        sameSite: 'Strict'
      });

      // Réponse JSON
      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);

      if (error.isJoi) {
        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          details: error.details.map(d => d.message)
        });
      }

      res.status(500).json({ success: false, message: 'Erreur du serveur' });
    }
  },

  // 📌 Suppression du profil
  deleteProfile: async (req, res) => {
    const userId = req.params.id;

    try {
      // Supprimer les relations dans les tables de jonction
      await sequelize.query('DELETE FROM user_has_follow WHERE follower_id = :userId OR followed_id = :userId', {
        replacements: { userId },
        type: sequelize.QueryTypes.DELETE
      });

      await sequelize.query('DELETE FROM user_has_skill WHERE user_id = :userId', {
        replacements: { userId },
        type: sequelize.QueryTypes.DELETE
      });

      // Supprimer les avis
      await Review.destroy({ where: { reviewer_id: userId } });
      await Review.destroy({ where: { reviewed_id: userId } });

      // Supprimer les messages
      await Message.destroy({ where: { sender_id: userId } });
      await Message.destroy({ where: { receiver_id: userId } });

      // Supprimer les notifications
      await Notification.destroy({ where: { user_id: userId } });

      // Supprimer l'utilisateur
      await User.destroy({ where: { id: userId } });

      // Nettoyer les cookies
      res.clearCookie('userInfo');
      res.clearCookie('token');

      // Réponse JSON
      res.json({
        success: true,
        message: 'Compte supprimé avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error);
      res.status(500).json({ success: false, message: 'Erreur du serveur' });
    }
  }
};

export default profilController;
