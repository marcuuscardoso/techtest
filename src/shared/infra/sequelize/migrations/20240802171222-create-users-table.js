"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      uuid: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: {
          name: "unique_user_uuid",
          msg: "Colisão no UUID do usuário."
        },
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      cnpj: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      legalName: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      brandName: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      neighborhood: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      street: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM("ADMIN", "USER"),
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING(256),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  }
};
