'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('images', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('images', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id'
      }
    });
  }
};
