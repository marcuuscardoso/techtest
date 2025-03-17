"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("users", [
      {
        uuid: "e7e6e3b0-e2d0-11ed-a1f0-0242ac120002",
        name: "John Doe",
        email: "johndoe@example.com",
        phone: "11987654321",
        cnpj: "48261039000199",
        legalName: "Doe Legal",
        brandName: "Doe Brand",
        state: "SP",
        city: "São Paulo",
        neighborhood: "Centro",
        street: "Rua Exemplo",
        number: 123,
        role: "ADMIN",
        password: "$2b$10$D39YHf0FdvoHi6WYGLfWju7w9WqvJkJQkhKAGOqkWPQjet7lSeYHa",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
  }
};
