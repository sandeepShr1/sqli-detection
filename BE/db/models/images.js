'use strict';

module.exports = (sequelize, DataTypes) => {
  const Image = sequelize.define('images', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'products',
        key: 'id'
      }
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    public_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    secure_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    tableName: 'images',
    timestamps: true
  });

  Image.associate = function (models) {
    Image.belongsTo(models.products, {
      foreignKey: 'productId',
      as: 'product'
    });
  };

  return Image;
};