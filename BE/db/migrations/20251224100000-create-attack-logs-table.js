'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
      async up(queryInterface, Sequelize) {
            await queryInterface.createTable('attack_logs', {
                  id: {
                        allowNull: false,
                        autoIncrement: true,
                        primaryKey: true,
                        type: Sequelize.INTEGER
                  },
                  payload: {
                        type: Sequelize.TEXT,
                        allowNull: false
                  },
                  confidence: {
                        type: Sequelize.FLOAT,
                        allowNull: false
                  },
                  ip: {
                        type: Sequelize.STRING,
                        allowNull: true
                  },
                  route: {
                        type: Sequelize.STRING,
                        allowNull: false
                  },
                  method: {
                        type: Sequelize.STRING,
                        allowNull: false
                  },
                  userId: {
                        type: Sequelize.INTEGER,
                        allowNull: true,
                        references: {
                              model: 'user',
                              key: 'id'
                        },
                        onUpdate: 'CASCADE',
                        onDelete: 'SET NULL'
                  },
                  userAgent: {
                        type: Sequelize.TEXT,
                        allowNull: true
                  },
                  createdAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                  },
                  updatedAt: {
                        allowNull: false,
                        type: Sequelize.DATE,
                        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                  }
            });

            // Add index for faster queries
            await queryInterface.addIndex('attack_logs', ['ip']);
            await queryInterface.addIndex('attack_logs', ['userId']);
            await queryInterface.addIndex('attack_logs', ['createdAt']);
      },

      async down(queryInterface, Sequelize) {
            await queryInterface.dropTable('attack_logs');
      }
};
