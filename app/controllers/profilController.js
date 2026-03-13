import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { User, Skill, Review } from "../models/index.js";

const normalizeImage = (image) => image ? image.replace(/^\/uploads\/avatars\//, '') : null;
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

      // Régénérer le JWT avec les nouvelles infos (prénom, nom, email)
      // pour que le middleware userInfo ait les données à jour
      const jwt = await import('jsonwebtoken');
      const newToken = jwt.default.sign(
        { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );
      res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      });

      res.redirect(`/user/${userId}/profil`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  },

  // ── Méthodes JSON pour l'API React ──────────────────────────────────────────

  getProfil: async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'firstname', 'lastname', 'bio', 'city', 'image', 'interest'],
        include: [
          { model: Skill, as: 'skills', attributes: ['id', 'label', 'slug'], through: { attributes: [] } },
          { model: Review, as: 'received_reviews', include: [{ model: User, as: 'reviewer', attributes: ['id', 'firstname', 'lastname', 'image'] }] },
          { model: User, as: 'followers', attributes: ['id'] },
        ],
      });
      if (!user) return res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Utilisateur introuvable' });

      const reviews = user.received_reviews || [];
      const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rate, 0) / reviews.length : 0;
      const isFollowing = req.user ? user.followers.some(f => f.id === req.user.id) : false;

      return res.json({
        user: {
          id: user.id, firstname: user.firstname, lastname: user.lastname,
          bio: user.bio, city: user.city, image: normalizeImage(user.image), interest: user.interest,
          skills: user.skills,
          reviews: reviews.map(r => ({
            id: r.id, rate: r.rate, comment: r.comment, created_at: r.created_at,
            reviewer: { ...r.reviewer.toJSON(), image: normalizeImage(r.reviewer?.image) },
          })),
          averageRating: Math.round(avgRating * 10) / 10,
          reviewCount: reviews.length,
          followerCount: user.followers.length,
          isFollowing,
        }
      });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  getMyProfil: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: Skill, as: 'skills', attributes: ['id', 'label', 'slug'], through: { attributes: [] } }],
      });
      if (!user) return res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Utilisateur introuvable' });
      const userData = user.toJSON();
      userData.image = normalizeImage(userData.image);
      return res.json({ user: userData });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  apiUpdateProfile: async (req, res) => {
    const userId = req.user.id;
    try {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Utilisateur introuvable' });

      await userUpdateSchema.validateAsync(req.body);
      const { firstname, lastname, email, bio } = req.body;
      const updateData = { firstname, lastname, email };
      if (bio !== undefined) updateData.bio = bio.trim();

      if (req.file) {
        if (user.image) fs.unlink(path.join('public', 'uploads', 'avatars', normalizeImage(user.image)), () => {});
        updateData.image = req.file.filename;
      }

      await user.update(updateData);

      const newToken = jwt.sign(
        { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );
      res.cookie('token', newToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Strict' });

      return res.json({ user: { id: user.id, email: user.email, firstname: user.firstname, lastname: user.lastname, bio: user.bio, image: normalizeImage(user.image) } });
    } catch (error) {
      if (error.isJoi) return res.status(400).json({ status: 400, code: 'VALIDATION_ERROR', message: error.details[0].message });
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
    }
  },

  apiDeleteProfile: async (req, res) => {
    try {
      await User.destroy({ where: { id: req.user.id } });
      res.clearCookie('token');
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ status: 500, code: 'SERVER_ERROR', message: 'Erreur serveur' });
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
      res.redirect('/');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte :', error);
      res.status(500).json({ error: 'Erreur du serveur' });
    }
  },
};

export default profilController;
