import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Role extends Sequelize.Model {}

Role.init(
  {
    label:{
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "role",
    underscored: true,
  }
);