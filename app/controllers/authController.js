import argon2 from 'argon2';
import { User } from '../models/User.js';
import { userCreateSchema, userLoginSchema } from '../schemas/user.schema.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const authController={
  renderRegisterPage(req,res,errors={},formData={}){
    const title ="Inscription";
    const cssFile = "register";
    res.render("register", { title , cssFile ,errors, formData });
  },

  renderloginPage(req,res){
    const title = "Connexion";
    const cssFile = "login";
    res.render("login", { title , cssFile });
  },

  async register(req,res){
    try {
      const value  = await userCreateSchema.validateAsync(req.body, { abortEarly: false });
  
      const { firstname, lastname, email, password } = value;
  
      const hashedPassword = await argon2.hash(password);
  
      const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

      console.log(token);

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
        httpOnly: false,  // ⚠️ Accessible par le frontend
        secure: true,
        sameSite: 'Strict'
      });
  
      res.redirect('/onboarding');
  
    } catch (error) {
      if (error.isJoi) {
        const errors = {};
        error.details.forEach(err => {
          const field = err.path[0];
          errors[field] = err.message;
        });
  
        return res.render("register", {
          title: "Inscription",
          cssFile: "register",
          errors,
          formData: req.body
        });
      }
  
      console.error(error);
      res.status(500).send("Erreur du serveur");
    }
  
        
  },

  async login(req,res){
    try {
      const title = "Connexion";
      const cssFile = "login";
      const value = await userLoginSchema.validateAsync(req.body, { allowUnknown: true });
      const { email, password } = value;
      
      const user = await User.findOne({
        where: { email }
      });

      if (!user || !await argon2.verify(user.password, password)) {
        console.log('je ne trouve rien');
        return res.render('login',{title,cssFile,error:'Email ou mot de passe incorrect'});
      }

      // Génération du JWT sécurisé
      // 🔑 Générer un JWT Token
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES });

      
      console.log(token);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict' // ⚠️ SameSite pour éviter les attaques CSRF
      });

      res.cookie('userInfo', JSON.stringify({
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,

      }), {
        httpOnly: false,  // ⚠️ Accessible par le frontend
        secure: true,
        sameSite: 'strict'
      });

      res.redirect('/protected');

    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur du serveur');
    }
  },
  
  logout: (req, res) => {
    res.clearCookie('token');
    res.clearCookie('userInfo');
    res.redirect('/');
  },
};

export default authController;
