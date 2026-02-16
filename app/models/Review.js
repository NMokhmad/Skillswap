import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Review extends Sequelize.Model {}

Review.init(
  {
    rate:{
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    content:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    skill_id:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "review",
    underscored: true,
  }
);