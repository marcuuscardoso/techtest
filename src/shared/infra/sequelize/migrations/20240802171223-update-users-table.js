'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('users', {
      fields: ['email'],
      type: 'unique',
      name: 'unique_user_email'
    });

    await queryInterface.removeColumn('users', 'name');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'state');
    await queryInterface.removeColumn('users', 'city');
    await queryInterface.removeColumn('users', 'neighborhood');
    await queryInterface.removeColumn('users', 'street');
    await queryInterface.removeColumn('users', 'number');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('users', 'unique_user_email');

    await queryInterface.addColumn('users', 'name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('users', 'state', {
      type: Sequelize.STRING(256),
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('users', 'city', {
      type: Sequelize.STRING(256),
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('users', 'neighborhood', {
      type: Sequelize.STRING(256),
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('users', 'street', {
      type: Sequelize.STRING(256),
      allowNull: false,
      defaultValue: ''
    });
    await queryInterface.addColumn('users', 'number', {
      type: Sequelize.STRING(256),
      allowNull: false,
      defaultValue: ''
    });
  }
}; 