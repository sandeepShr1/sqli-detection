'use strict';

module.exports = (sequelize, DataTypes) => {
      const Order = sequelize.define('orders', {
            id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: DataTypes.INTEGER
            },
            userId: {
                  type: DataTypes.INTEGER,
                  allowNull: false,
                  references: {
                        model: 'user',
                        key: 'id'
                  }
            },
            // Shipping Info
            shippingAddress: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            shippingCity: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            shippingState: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            shippingPinCode: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            shippingPhoneNo: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            // Payment Info
            paymentId: {
                  type: DataTypes.STRING,
                  allowNull: true
            },
            paymentStatus: {
                  type: DataTypes.STRING,
                  allowNull: true
            },
            paidAt: {
                  type: DataTypes.DATE,
                  allowNull: false
            },
            // Pricing
            itemsPrice: {
                  type: DataTypes.DECIMAL(10, 2),
                  allowNull: false,
                  defaultValue: 0
            },
            taxPrice: {
                  type: DataTypes.DECIMAL(10, 2),
                  allowNull: false,
                  defaultValue: 0
            },
            shippingPrice: {
                  type: DataTypes.DECIMAL(10, 2),
                  allowNull: false,
                  defaultValue: 0
            },
            totalPrice: {
                  type: DataTypes.DECIMAL(10, 2),
                  allowNull: false,
                  defaultValue: 0
            },
            // Order Status
            orderStatus: {
                  type: DataTypes.ENUM('Processing', 'Shipped', 'Delivered', 'Cancelled'),
                  allowNull: false,
                  defaultValue: 'Processing'
            },
            deliveredAt: {
                  type: DataTypes.DATE,
                  allowNull: true
            },
            createdAt: {
                  allowNull: false,
                  type: DataTypes.DATE
            },
            updatedAt: {
                  allowNull: false,
                  type: DataTypes.DATE
            }
      }, {
            tableName: 'orders',
            timestamps: true
      });

      Order.associate = function (models) {
            Order.belongsTo(models.user, {
                  foreignKey: 'userId',
                  as: 'user'
            });
            Order.hasMany(models.order_items, {
                  foreignKey: 'orderId',
                  as: 'orderItems'
            });
      };

      return Order;
};
