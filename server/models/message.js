'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      // Message belongs to a Chat and a User (Sender)
      this.belongsTo(models.Chat, { foreignKey: 'chatId' });
      this.belongsTo(models.User, { foreignKey: 'senderId' }); // Assuming 'Users' is the table of all users
      this.hasOne(models.Attachment, { foreignKey: 'messageId' }); // One message may have one attachment
    }
  }

  Message.init({
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Chats', // Refers to the 'Chats' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Refers to the 'Users' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    messageText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    messageType: {
      type: DataTypes.ENUM('text', 'document', 'image'),
      allowNull: false,
      defaultValue: 'text',
    },
  }, {
    sequelize,
    modelName: 'Message',
    timestamps: true,
  });

  return Message;
};