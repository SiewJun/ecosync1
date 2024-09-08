'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CompanyGallery extends Model {
    static associate(models) {
      // Associate with CompanyProfile
      this.belongsTo(models.CompanyProfile, { foreignKey: 'companyProfileId' });
    }
  }

  CompanyGallery.init({
    companyProfileId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CompanyProfiles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'CompanyGallery',
    timestamps: true,
  });

  return CompanyGallery;
};
