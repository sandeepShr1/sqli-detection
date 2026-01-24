'use strict';
const AppError = require('../../utils/appError');

module.exports = (sequelize, DataTypes) => {
  const Products = sequelize.define("products", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "name cannot be null"
        },
        notEmpty: {
          msg: "name cannot be empty"
        }
      }

    },
    description: {
      type: DataTypes.STRING
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "category cannot be null"
        },
        notEmpty: {
          msg: "category cannot be empty"
        }
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        notNull: {
          msg: "price cannot be null"
        },
        notEmpty: {
          msg: "price cannot be empty"
        },
        min: 1,
        max: 10000000
      }
    },
    stock: {
      type: DataTypes.NUMBER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "stock cannot be null"
        },
        notEmpty: {
          msg: "stock cannot be empty"
        },
        min: 1,
        max: 1000
      }
    },
    rating: {
      type: DataTypes.NUMBER,
      defaultValue: 0
    },
    numOfReviews: {
      type: DataTypes.NUMBER,
      defaultValue: 0
    },


    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  });

  Products.associate = function (models) {
    Products.hasMany(models.reviews, { as: "reviews", onDelete: 'CASCADE', foreignKey: 'productId' });
    Products.hasMany(models.images, { as: 'images', foreignKey: 'productId' });
  };

  return Products;
};