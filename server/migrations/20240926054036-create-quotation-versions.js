"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("QuotationVersions", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      quotationId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Quotations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
        defaultValue: [],
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
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      versionNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      status: {
        type: Sequelize.STRING, // Changed from ENUM to STRING
        allowNull: false,
        defaultValue: "DRAFT",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("QuotationVersions");
  },
};
