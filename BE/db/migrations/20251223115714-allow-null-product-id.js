module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('images', 'productId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
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