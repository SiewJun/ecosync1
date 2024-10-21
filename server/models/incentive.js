"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Incentive extends Model {
    static associate(models) {
      // Add associations here if needed in the future
    }
  }

  Incentive.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      eligibilityCriteria: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      incentiveAmount: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      applicationLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "ACTIVE",
      },
    },
    {
      sequelize,
      modelName: "Incentive",
      timestamps: true,
    }
  );

  return Incentive;
};
