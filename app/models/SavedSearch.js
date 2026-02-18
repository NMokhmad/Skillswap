import { Sequelize, DataTypes } from "sequelize";
import { sequelize } from "../database.js";

export class SavedSearch extends Sequelize.Model {}

SavedSearch.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filters: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: "saved_search",
    underscored: true,
  }
);
