'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('banners', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      buttonText: {
        type: Sequelize.STRING,
        allowNull: false
      },
      product: {
        type: Sequelize.STRING,
        allowNull: false
      },
      desc: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      smallText: {
        type: Sequelize.STRING,
        allowNull: false
      },
      midText: {
        type: Sequelize.STRING,
        allowNull: false
      },
      largeText1: {
        type: Sequelize.STRING,
        allowNull: false
      },
      largeText2: {
        type: Sequelize.STRING,
        allowNull: false
      },
      discount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Create banner_images table
    await queryInterface.createTable('banner_images', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bannerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'banners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      public_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('banner_images');
    await queryInterface.dropTable('banners');
  }
};
