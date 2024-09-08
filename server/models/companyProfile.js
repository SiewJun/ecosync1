'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyProfile extends Model {
    static associate(models) {
      // Associate with User
      this.belongsTo(models.User, { foreignKey: 'userId' });

      // Associate with Gallery and Solutions
      this.hasMany(models.CompanyGallery, { foreignKey: 'companyProfileId' });
      this.hasMany(models.SolarSolution, { foreignKey: 'companyProfileId' });
    }
  }

  CompanyProfile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    overview: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    certificate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    services: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'CompanyProfile',
    timestamps: true,
  });

  return CompanyProfile;
};
