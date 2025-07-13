import { User } from "../models/User.js";
import { userUpdateSchema } from "../schemas/userUpdateSchema.js";
import { Review } from "../models/Review.js";
import { Message } from "../models/Message.js";
import { sequelize } from "../database.js";
import { Notification } from "../models/Notification.js";


const profilController = {
  updateProfile: async (req, res) => {
    const userId = parseInt(req.params.id); // Récupère l'ID de l'utilisateur à partir des paramètres de la route
    console.log('ID de l\'utilisateur :', userId);
    console.log('Données du formulaire :', req.body);
    const inputData= req.body;

    try {
      // Récupère les données du formulaire
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }
      await userUpdateSchema.validateAsync(inputData);
      await user.update(inputData);
      res.cookie('userInfo', JSON.stringify({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
      }), 
      {
        httpOnly: false,  // ⚠️ Accessible par le frontend
        secure: true,
        sameSite: 'none'
      });
      res.redirect(`/user/${userId}/profil`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  },
  deleteProfile: async (req, res) => {
    const userId = req.params.id;
  
    try {
      // Supprimer les relations dans les tables de jonction avant de supprimer l'utilisateur
      await sequelize.query('DELETE FROM user_has_follow WHERE follower_id = :userId OR followed_id = :userId', {
        replacements: { userId },
        type: sequelize.QueryTypes.DELETE
      });
  
      // Supprimer les enregistrements associés dans les autres tables
      await sequelize.query('DELETE FROM user_has_skill WHERE user_id = :userId', {
        replacements: { userId },
        type: sequelize.QueryTypes.DELETE
      });
  
      // Supprimer les avis envoyés et reçus par l'utilisateur
      await Review.destroy({ where: { reviewer_id: userId } });
      await Review.destroy({ where: { reviewed_id: userId } });
  
      // Supprimer les messages envoyés et reçus par l'utilisateur
      await Message.destroy({ where: { sender_id: userId } });
      await Message.destroy({ where: { receiver_id: userId } });
  
      // Supprimer les notifications associées à l'utilisateur
      await Notification.destroy({ where: { user_id: userId } });
  
      // Maintenant, supprimer l'utilisateur de la table `User`
      await User.destroy({ where: { id: userId } });
  
      // Rediriger vers la page d'accueil après la suppression
      res.clearCookie('userInfo');
      res.redirect('/');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  },  
};

export default profilController;