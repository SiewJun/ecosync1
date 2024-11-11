'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      // Chat belongs to Consumer and Company (User table)
      this.belongsTo(models.User, { as: 'Consumer', foreignKey: 'consumerId' });
      this.belongsTo(models.User, { as: 'Company', foreignKey: 'companyId' });
      this.hasMany(models.Message, { foreignKey: 'chatId' }); // One Chat has many Messages
    }
  }
  
  Chat.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consumerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Assuming the 'Users' table exists
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Assuming the 'Users' table exists
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  }, {
    sequelize,
    modelName: 'Chat',
    timestamps: true,
  });

  return Chat;
};