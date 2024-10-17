'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ProjectStep extends Model {
    static associate(models) {
      // Each step belongs to a project
      this.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    }
  }

  ProjectStep.init({
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    stepName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    stepType: {
      type: DataTypes.ENUM('DEPOSIT', 'DOCUMENT_UPLOAD', 'FINAL_PAYMENT', 'INSTALLATION', 'COMPLETION'),
      allowNull: false,
    },
    paymentAmount: {  // Added for payment steps
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,  // Only for payment-related steps
    },
    filePaths: {  // Changed from filePath to filePaths
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],  // Default to an empty array
    },
    stepOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isMandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDING',
    },
    paymentStatus: {  // Track payment separately
      type: DataTypes.ENUM('PENDING', 'PAID', 'FAILED'),
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    assignedTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ProjectStep',
    timestamps: true,
  });

  return ProjectStep;
};
