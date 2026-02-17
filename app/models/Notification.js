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
    is_read:{
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    related_entity_type:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    related_entity_id:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    action_url:{
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "notification",
    underscored: true,
  }
);