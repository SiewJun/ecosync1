'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SolarSolution extends Model {
    static associate(models) {
      // Associate with CompanyProfile
      this.belongsTo(models.CompanyProfile, { foreignKey: 'companyProfileId' });
    }
  }

  SolarSolution.init({
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
    solutionName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    solarPanelType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    powerOutput: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    efficiency: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    warranty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'SolarSolution',
    timestamps: true,
  });

  return SolarSolution;
};