'use strict';
const AppError = require('../../utils/appError');

module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('reviews', {
    rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
    name: { type: DataTypes.STRING, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false }
  });

  Review.associate = function (models) {
    Review.belongsTo(models.user, { as: 'user', foreignKey: 'userId' });
    Review.belongsTo(models.products, { as: 'product', foreignKey: 'productId' });
  };

  return Review;
};   