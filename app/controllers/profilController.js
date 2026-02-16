import fs from 'fs';
import path from 'path';
import { User } from "../models/User.js";
import { userUpdateSchema } from "../schemas/userUpdateSchema.js";

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
      const { firstname, lastname, email, bio } = req.body;
      const updateData = { firstname, lastname, email };

      // Ajouter la bio si fournie
      if (bio !== undefined) {
        updateData.bio = bio.trim();
      }

      // Gérer l'upload de l'avatar
      if (req.file) {
        const avatarPath = `/uploads/avatars/${req.file.filename}`;

        // Supprimer l'ancien avatar du disque s'il existe
        if (user.image) {
          const oldPath = path.join('public', user.image);
          fs.unlink(oldPath, () => {}); // Ignorer l'erreur si le fichier n'existe plus
        }

        updateData.image = avatarPath;
      }

      await user.update(updateData);

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
      // ON DELETE CASCADE sur toutes les FK supprime automatiquement
      // les reviews, messages, notifications, follows et skills liés
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
