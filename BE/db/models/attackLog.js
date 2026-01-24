'use strict';

module.exports = (sequelize, DataTypes) => {
      const AttackLog = sequelize.define('attack_logs', {
            id: {
                  allowNull: false,
                  autoIncrement: true,
                  primaryKey: true,
                  type: DataTypes.INTEGER
            },
            payload: {
                  type: DataTypes.TEXT,
                  allowNull: false
            },
            confidence: {
                  type: DataTypes.FLOAT,
                  allowNull: false
            },
            ip: {
                  type: DataTypes.STRING,
                  allowNull: true
            },
            route: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            attackType: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            method: {
                  type: DataTypes.STRING,
                  allowNull: false
            },
            userId: {
                  type: DataTypes.INTEGER,
                  allowNull: true
            },
            userAgent: {
                  type: DataTypes.TEXT,
                  allowNull: true
            }
      });

      AttackLog.associate = function (models) {
            AttackLog.belongsTo(models.user, { as: 'user', foreignKey: 'userId' });
      };

      return AttackLog;
};
