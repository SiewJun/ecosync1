'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // A project belongs to a consumer and a company
      this.belongsTo(models.User, { as: 'consumer', foreignKey: 'consumerId' });
      this.belongsTo(models.User, { as: 'company', foreignKey: 'companyId' });

      // A project relates to a specific quotation
      this.belongsTo(models.Quotation, { foreignKey: 'quotationId', as: 'quotation' });

      // A project has many steps (ProjectStep)
      this.hasMany(models.ProjectStep, { foreignKey: 'projectId', as: 'steps' });

      // A project has many maintenances (Maintenance)
      this.hasMany(models.Maintenance, { foreignKey: 'projectId', as: 'maintenance' });

    }
  }

  Project.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    consumerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    companyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    quotationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Quotations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'PENDING',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Project',
    timestamps: true,
  });

  return Project;
};