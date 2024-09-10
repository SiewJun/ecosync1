'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConsumerProfile extends Model {
    static associate(models) {
      // Association with User model
      this.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }

  ConsumerProfile.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ConsumerProfile',
  });

  return ConsumerProfile;
};
