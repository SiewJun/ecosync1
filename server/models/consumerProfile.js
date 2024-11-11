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