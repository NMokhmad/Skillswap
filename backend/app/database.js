import dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(process.env.PG_URL,{
  define: {
    updatedAt: 'updated_at',
    createdAt: 'created_at',
  }
});