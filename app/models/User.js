import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class User extends Sequelize.Model {}

User.init(
  {
    firstname:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastname:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    email:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    password:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    image:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    interest:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_available:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "user",
    underscored: true,
  }
);