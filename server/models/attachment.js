'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Attachment extends Model {
    static associate(models) {
      // Attachment belongs to a Message
      this.belongsTo(models.Message, { foreignKey: 'messageId' });
    }
  }

  Attachment.init({
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Messages', // Refers to the 'Messages' table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileType: {
      type: DataTypes.ENUM('image', 'document'),
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Attachment',
    timestamps: true,
  });

  return Attachment;
};
