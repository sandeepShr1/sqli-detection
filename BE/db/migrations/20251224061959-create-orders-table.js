'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      // Shipping Info
      shippingAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingCity: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingState: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingPinCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shippingPhoneNo: {
        type: Sequelize.STRING,
        allowNull: false
      },
      // Payment Info
      paymentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paymentStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      // Pricing
      itemsPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      taxPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      shippingPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      totalPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      // Order Status
      orderStatus: {
        type: Sequelize.ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled'),
        allowNull: false,
        defaultValue: 'Processing'
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    // Create order items table
    await queryInterface.createTable('order_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      productId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      image: {
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
    await queryInterface.dropTable('order_items');
    await queryInterface.dropTable('orders');
  }
};
