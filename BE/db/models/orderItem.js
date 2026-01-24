'use strict';

module.exports = (sequelize, DataTypes) => {
      const OrderItem = sequelize.define('order_items', {
            id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: DataTypes.INTEGER
            },
            orderId: {
                  type: DataTypes.INTEGER,
                  allowNull: false,
                  references: {
                        model: 'orders',
                        key: 'id'
                  }
            },
            productId: {
                  type: DataTypes.INTEGER,
                  allowNull: false,
                  references: {
                        model: 'products',
                        key: 'id'
                  }
            },
            name: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            price: {
                  type: DataTypes.DECIMAL(10, 2),
                  allowNull: false
            },
            quantity: {
                  type: DataTypes.INTEGER,
                  allowNull: false
            },
            image: {
                  type: DataTypes.STRING,
                  allowNull: false
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
            tableName: 'order_items',
            timestamps: true
      });

      OrderItem.associate = function (models) {
            OrderItem.belongsTo(models.orders, {
                  foreignKey: 'orderId',
                  as: 'order'
            });
            OrderItem.belongsTo(models.products, {
                  foreignKey: 'productId',
                  as: 'product'
            });
      };

      return OrderItem;
};
