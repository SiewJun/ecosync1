'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SolarSolutions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      companyProfileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CompanyProfiles', // Ensure the table name is pluralized
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      solutionName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      solarPanelType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      powerOutput: {
        type: Sequelize.INTEGER, // Power output in watts
        allowNull: false
      },
      efficiency: {
        type: Sequelize.FLOAT, // Efficiency in percentage
        allowNull: false
      },
      warranty: {
        type: Sequelize.INTEGER, // Warranty in years
        allowNull: false
      },
      price: {
        type: Sequelize.FLOAT, // Price of the solution
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SolarSolutions');
  }
};
