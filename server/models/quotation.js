'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Quotation extends Model {
    static associate(models) {
      // Quotation belongs to a Consumer and a Company (both referencing the 'User' table)
      this.belongsTo(models.User, { as: 'consumer', foreignKey: 'consumerId' });
      this.belongsTo(models.User, { as: 'company', foreignKey: 'companyId' });
    }
  }

  Quotation.init({
    consumerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to the 'Users' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companyId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to the 'Users' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
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
      defaultValue: 'PENDING', // Track whether it's a draft or finalized
      allowNull: false,
    },
    quotationDraft: {
      type: DataTypes.TEXT,  // Store the Quill.js JSON or HTML content
      allowNull: true,       // Initially null until the company drafts the quotation
    },
  }, {
    sequelize,
    modelName: 'Quotation',
    timestamps: true,
  });

  return Quotation;
};