"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QuotationVersion extends Model {
    static associate(models) {
      // Each version belongs to a specific quotation
      this.belongsTo(models.Quotation, {
        foreignKey: "quotationId",
        as: "quotation",
      });
    }
  }

  QuotationVersion.init(
    {
      quotationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Quotations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      systemSize: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      panelSpecifications: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      costBreakdown: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      estimatedEnergyProduction: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      savings: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paybackPeriod: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      roi: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      incentives: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      productWarranties: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      timeline: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
      },
      versionNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: DataTypes.STRING, // Changed from ENUM to STRING
        allowNull: false,
        defaultValue: "DRAFT",
      },
    },
    {
      sequelize,
      modelName: "QuotationVersion",
      timestamps: true,
    }
  );

  return QuotationVersion;
};
