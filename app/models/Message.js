import { Sequelize,DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class Message extends Sequelize.Model {}

Message.init(
  {
    content:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_read:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "message",
    underscored: true,
  }
);
