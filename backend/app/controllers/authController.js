import jwt from 'jsonwebtoken';
import argon2 from 'argon2';
import { User } from '../models/User.js';
import { userCreateSchema, userLoginSchema } from '../schemas/userSchema.js';

const authController = {
  // 📌 Inscription
  async register(req, res) {
    try {
      // Validation des données
      const value = await userCreateSchema.validateAsync(req.body, { abortEarly: false });
      const { firstname, lastname, email, password } = value;

      // Hash du mot de passe
      const hashedPassword = await argon2.hash(password);

      // Création de l'utilisateur
      const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword
      });

      // Génération du token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      // Cookie JWT sécurisé
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
      });

      // Infos utilisateur côté client
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
      res.status(201).json({
        success: true,
        message: "Inscription réussie",
        token,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      });

    } catch (error) {
      if (error.isJoi) {
        // Erreurs de validation
        const errors = {};
        error.details.forEach(err => {
          errors[err.path[0]] = err.message;
        });

        return res.status(400).json({
          success: false,
          errors
        });
      }

      console.error(error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur"
      });
    }
  },

  // 📌 Connexion
  async login(req, res) {
    try {
      const value = await userLoginSchema.validateAsync(req.body, { allowUnknown: true });
      const { email, password } = value;

      const user = await User.findOne({ where: { email } });

      if (!user || !await argon2.verify(user.password, password)) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect"
        });
      }

      // Génération du token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES }
      );

      // Cookies
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
      });

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
        message: "Connexion réussie",
        token,
        user: {
          id: user.id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email
        }
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur"
      });
    }
  },

  // 📌 Déconnexion
  logout(req, res) {
    res.clearCookie('token');
    res.clearCookie('userInfo');
    res.json({
      success: true,
      message: "Déconnecté avec succès"
    });
  }
};

export default authController;

