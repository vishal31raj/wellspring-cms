"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Creators Table
    await queryInterface.createTable("creators", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password: { type: Sequelize.STRING, allowNull: false },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 2. Programs Table
    await queryInterface.createTable("programs", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      creatorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "creators", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    // 3. Sessions Table
    await queryInterface.createTable("sessions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: false },
      instructorName: { type: Sequelize.STRING, allowNull: true },
      mediaFileUrl: { type: Sequelize.STRING, allowNull: true },
      programId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "programs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse dependency order
    await queryInterface.dropTable("sessions");
    await queryInterface.dropTable("programs");
    await queryInterface.dropTable("creators");
  },
};
