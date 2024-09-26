'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('QuotationVersions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quotationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Quotations', 
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      systemSize: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      panelSpecifications: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      costBreakdown: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      estimatedEnergyProduction: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      savings: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paybackPeriod: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      roi: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      incentives: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      productWarranties: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timeline: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'FINALIZED'), // Status can be either 'DRAFT' or 'FINALIZED'
        allowNull: false,
        defaultValue: 'DRAFT',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('QuotationVersions');
  },
};
