'use strict';

module.exports = (sequelize, DataTypes) => {
      const BannerImage = sequelize.define('banner_images', {
            id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: DataTypes.INTEGER
            },
            bannerId: {
                  type: DataTypes.INTEGER,
                  allowNull: false,
                  references: {
                        model: 'banners',
                        key: 'id'
                  }
            },
            url: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            public_id: {
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
            tableName: 'banner_images',
            timestamps: true
      });

      BannerImage.associate = function (models) {
            BannerImage.belongsTo(models.banners, {
                  foreignKey: 'bannerId',
                  as: 'banner'
            });
      };

      return BannerImage;
};
