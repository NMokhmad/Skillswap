import Joi from 'joi';

export const userCreateSchema = Joi.object({
  firstname: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      "string.empty": "Le prénom est requis.",
      "string.min": "Le prénom doit contenir au moins {#limit} caractères.",
      "string.max": "Le prénom ne peut pas dépasser {#limit} caractères.",
    }),

  lastname: Joi.string()
    .min(2)
    .max(30)
    .required()
    .messages({
      "string.empty": "Le nom est requis.",
      "string.min": "Le nom doit contenir au moins {#limit} caractères.",
      "string.max": "Le nom ne peut pas dépasser {#limit} caractères.",
    }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "L'email doit être valide.",
      "string.empty": "L'email est requis.",
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "Le mot de passe doit contenir au moins {#limit} caractères.",
      "string.empty": "Le mot de passe est requis.",
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("password")) // Vérifie que confirmPassword est identique à password
    .required()
    .messages({
      "any.only": "Les mots de passe ne correspondent pas.",
      "string.empty": "La confirmation du mot de passe est requise.",
    }),
}).with("password", "confirmPassword"); // Associe les deux champs

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});