'use strict';

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('notifications', {
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
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Notification.associate = function (models) {
    Notification.belongsTo(models.user, { as: 'user', foreignKey: 'userId' });
  };

  return Notification;
};