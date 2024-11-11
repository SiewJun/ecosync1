'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyDetail extends Model {
    static associate(models) {
      // CompanyDetail belongs to a User
      this.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  
  CompanyDetail.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companyName: {
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
      unique: true,
    },
    businessLicense: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stripeAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeOnboardingComplete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    sequelize,
    modelName: 'CompanyDetail',
    timestamps: true,
  });
  
  return CompanyDetail;
};