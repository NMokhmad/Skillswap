import { User } from "../models/User.js";
import { userUpdateSchema } from "../schemas/userUpdateSchema.js";
import { Review } from "../models/Review.js";
import { Message } from "../models/Message.js";
import { sequelize } from "../database.js";
import { Notification } from "../models/Notification.js";

const profilController = {
  // Route protégée par verifyJWT → req.user est garanti
  updateProfile: async (req, res) => {
    const userId = parseInt(req.params.id);

    // SÉCURITÉ : vérifier que l'utilisateur modifie SON propre profil
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre profil' });
    }

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Valider les données entrantes avec Joi
      await userUpdateSchema.validateAsync(req.body);

      // SÉCURITÉ : ne mettre à jour QUE les champs autorisés (whitelist)
      // Cela empêche le mass assignment (ex: un attaquant qui envoie role_id, password, etc.)
      const { firstname, lastname, email } = req.body;
      await user.update({ firstname, lastname, email });

      // Mettre à jour le cookie d'affichage
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

      res.redirect(`/user/${userId}/profil`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  },

  // Route protégée par verifyJWT → req.user est garanti
  deleteProfile: async (req, res) => {
    const userId = parseInt(req.params.id);

    // SÉCURITÉ : vérifier que l'utilisateur supprime SON propre compte
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Vous ne pouvez supprimer que votre propre compte' });
    }

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

      // Supprimer les avis envoyés et reçus
      await Review.destroy({ where: { reviewer_id: userId } });
      await Review.destroy({ where: { reviewed_id: userId } });

      // Supprimer les messages envoyés et reçus
      await Message.destroy({ where: { sender_id: userId } });
      await Message.destroy({ where: { receiver_id: userId } });

      // Supprimer les notifications
      await Notification.destroy({ where: { user_id: userId } });

      // Supprimer l'utilisateur
      await User.destroy({ where: { id: userId } });

      // Nettoyer les cookies et rediriger
      res.clearCookie('token');
      res.clearCookie('userInfo');
      res.redirect('/');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  },
};

export default profilController;
