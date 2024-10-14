"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Quotation extends Model {
    static associate(models) {
      // Quotation belongs to a Consumer and a Company
      this.belongsTo(models.User, { as: "consumer", foreignKey: "consumerId" });
      this.belongsTo(models.User, { as: "company", foreignKey: "companyId" });

      // Quotation has many versions
      this.hasMany(models.QuotationVersion, {
        foreignKey: "quotationId",
        as: "versions",
      });

      // Include the most recent version
      this.hasOne(models.QuotationVersion, {
        foreignKey: "quotationId",
        as: "latestVersion",
        order: [["createdAt", "DESC"]],
      });

      // Quotation has one project
      this.hasOne(models.Project, { foreignKey: "quotationId", as: "project" });
    }
  }

  Quotation.init(
    {
      consumerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      salutation: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      averageMonthlyElectricityBill: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      propertyType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quotationStatus: {
        type: DataTypes.STRING,
        defaultValue: "PENDING",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Quotation",
      timestamps: true,
    }
  );

  return Quotation;
};
