'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create ENUM types using raw SQL if they do not exist
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ProjectSteps_stepType') THEN
          CREATE TYPE "enum_ProjectSteps_stepType" AS ENUM('DEPOSIT', 'DOCUMENT_UPLOAD', 'FINAL_PAYMENT', 'INSTALLATION', 'COMPLETION');
        END IF;
      END$$;
    `);
    await queryInterface.sequelize.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_ProjectSteps_paymentStatus') THEN
          CREATE TYPE "enum_ProjectSteps_paymentStatus" AS ENUM('PENDING', 'PAID', 'FAILED');
        END IF;
      END$$;
    `);

    // Create the table
    await queryInterface.createTable('ProjectSteps', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      stepName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stepType: {
        type: Sequelize.ENUM('DEPOSIT', 'DOCUMENT_UPLOAD', 'FINAL_PAYMENT', 'INSTALLATION', 'COMPLETION'),
        allowNull: false
      },
      paymentAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      filePaths: {  // Changed from filePath to filePaths
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: [],  // Default to an empty array
      },
      stepOrder: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      isMandatory: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDING'
      },
      paymentStatus: {
        type: Sequelize.ENUM('PENDING', 'PAID', 'FAILED'),
        allowNull: true
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      assignedTo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Drop the table
    await queryInterface.dropTable('ProjectSteps');

    // Drop ENUM types using raw SQL
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_ProjectSteps_stepType";
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_ProjectSteps_paymentStatus";
    `);
  }
};