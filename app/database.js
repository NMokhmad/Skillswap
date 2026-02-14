import { Sequelize } from "sequelize";

// dotenv est déjà chargé une seule fois dans index.js via import 'dotenv/config'
// Pas besoin de le recharger ici

export const sequelize = new Sequelize(process.env.PG_URL, {
  define: {
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  },
  logging: false
});
