'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'avatarId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'images',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user', 'avatarId');
  }
};
