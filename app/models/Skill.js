import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Skill extends Sequelize.Model {}

Skill.init(
  {
    label:{
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    slug:{
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    icon:{
      type: DataTypes.TEXT
    },
  },
  {
    sequelize,
    tableName: "skill",
    underscored: true,
  }
);