import Joi from "joi";

export const userUpdateSchema = Joi.object({
  firstname: Joi.string()
    .min(2)
    .max(30)
    .messages({
      "string.empty": "Le prénom est requis.",
      "string.min": "Le prénom doit contenir au moins {#limit} caractères.",
      "string.max": "Le prénom ne peut pas dépasser {#limit} caractères.",
    }),
    
  lastname: Joi.string()
    .min(2)
    .max(30)
    .messages({
      "string.empty": "Le nom est requis.",
      "string.min": "Le nom doit contenir au moins {#limit} caractères.",
      "string.max": "Le nom ne peut pas dépasser {#limit} caractères.",
    }),
    
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .messages({
      "string.email": "L'email doit être valide.",
      "string.empty": "L'email est requis.",
    }),

  bio: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      "string.max": "La bio ne peut pas dépasser {#limit} caractères.",
    }),
});