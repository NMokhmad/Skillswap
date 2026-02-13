import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Notification extends Sequelize.Model {}

Notification.init(
  {
    type_notification:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    content:{
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "notification",
    underscored: true,
  }
);