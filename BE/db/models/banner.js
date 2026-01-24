'use strict';

module.exports = (sequelize, DataTypes) => {
      const Banner = sequelize.define('banners', {
            id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: DataTypes.INTEGER
            },
            buttonText: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            product: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            desc: {
                  type: DataTypes.TEXT,
                  allowNull: false
            },
            smallText: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            midText: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            largeText1: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            largeText2: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            discount: {
                  type: DataTypes.INTEGER,
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
      }, {
            tableName: 'banners',
            timestamps: true
      });

      Banner.associate = function (models) {
            Banner.hasMany(models.banner_images, {
                  foreignKey: 'bannerId',
                  as: 'images'
            });
      };

      return Banner;
};
