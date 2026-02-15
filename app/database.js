import { Sequelize } from "sequelize";

// dotenv est déjà chargé une seule fois dans index.js via import 'dotenv/config'
// Pas besoin de le recharger ici

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  define: {
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false  // Toujours false pour DigitalOcean
    }
  },
  logging: false
});

// Test de connexion
try {
  await sequelize.authenticate();
  console.log('✅ Database connected successfully');
} catch (error) {
  console.error('❌ Database connection failed:', error.message);
  process.exit(1);
}
