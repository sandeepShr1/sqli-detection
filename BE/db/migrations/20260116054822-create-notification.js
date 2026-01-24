// migrations/${timestamp}-create-notifications-table.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      read: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Optional: Add index on userId for performance
    await queryInterface.addIndex('notifications', ['userId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('notifications');
  },
};   