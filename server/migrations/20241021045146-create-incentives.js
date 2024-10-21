"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Incentives", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      region: {
        type: Sequelize.STRING, // To define which state/region the incentive applies to
        allowNull: false,
      },
      eligibilityCriteria: {
        type: Sequelize.TEXT, // Detailed text on who is eligible
        allowNull: false,
      },
      incentiveAmount: {
        type: Sequelize.STRING, // E.g. RM1000 rebate or 30% discount
        allowNull: false,
      },
      expirationDate: {
        type: Sequelize.DATE, // Date the incentive expires
        allowNull: true, // Some incentives may not have an expiration date
      },
      applicationLink: {
        type: Sequelize.STRING, // URL where users can apply for the incentive
        allowNull: true,
      },
      source: {
        type: Sequelize.STRING, // Where the incentive information comes from (e.g., "SEDA Malaysia")
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "ACTIVE", // ACTIVE, EXPIRED, etc.
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
    await queryInterface.dropTable("Incentives");
  },
};
