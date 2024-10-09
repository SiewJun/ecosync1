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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDING',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'ProjectStep',
    timestamps: true,
  });

  return ProjectStep;
};
