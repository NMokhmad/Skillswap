import { Sequelize } from "sequelize";
import { logger } from "./helpers/logger.js";

// dotenv est déjà chargé une seule fois dans index.js via import 'dotenv/config'
// Pas besoin de le recharger ici

const databaseUrl = process.env.DATABASE_URL || 'postgres://skillswap:skillswap@localhost:5432/skillswap';
const strictDbSsl = process.env.ENABLE_STRICT_DB_SSL === 'true';
const dbSslCa = process.env.DATABASE_SSL_CA
  ? process.env.DATABASE_SSL_CA.replace(/\\n/g, '\n')
  : undefined;

const dialectOptions = process.env.NODE_ENV === 'production'
  ? {
    ssl: strictDbSsl
      ? {
        require: true,
        rejectUnauthorized: true,
        ca: dbSslCa,
      }
      : {
        require: true,
        rejectUnauthorized: false,
      },
  }
  : {};

export const sequelize = new Sequelize(databaseUrl, {
  define: {
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  },
  dialectOptions,
  logging: false
});

export async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    logger.info('database_connection_ok', { strictDbSsl, env: process.env.NODE_ENV || 'development' });
    return true;
  } catch (error) {
    logger.error('database_connection_failed', { error: error.message });
    return false;
  }
}
