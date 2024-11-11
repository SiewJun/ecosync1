'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CompanyApplication extends Model {
    static associate(models) {
      // define association here if needed
    }
  }
  CompanyApplication.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    companyName: {
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
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    website: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    registrationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    businessLicense: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'Pending',
    }
  }, {
    sequelize,
    modelName: 'CompanyApplication',
    timestamps: true,
  });
  return CompanyApplication;
};