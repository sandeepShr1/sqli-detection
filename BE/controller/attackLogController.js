const db = require('../db/models');
const AttackLog = db.attack_logs;
const catchAsyncError = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { where } = require('sequelize');

// Get all attack logs (Admin only)
const getAllAttackLogs = catchAsyncError(async (req, res, next) => {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: logs } = await AttackLog.findAndCountAll({
            include: [{
                  model: db.user,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
      });

      res.status(200).json({
            success: true,
            totalLogs: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            logs
      });
});

// Get attack log statistics (Admin only)
const getAttackStats = catchAsyncError(async (req, res, next) => {
      const totalAttacks = await AttackLog.count();

      const highConfidenceAttacks = await AttackLog.count({
            where: {
                  confidence: { [db.Sequelize.Op.gte]: 0.8 }
            }
      });

      const sqliCount = await AttackLog.count({
            where: {
                  attackType: "SQL Injection"
            }
      })
      const xssCount = await AttackLog.count({
            where: {
                  attackType: "XSS"
            }
      })

      const last24Hours = await AttackLog.count({
            where: {
                  createdAt: {
                        [db.Sequelize.Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                  }
            }
      });

      res.status(200).json({
            success: true,
            stats: {
                  totalAttacks,
                  highConfidenceAttacks,
                  last24Hours,
                  sqliCount,
                  xssCount
            }
      });
});

module.exports = {
      getAllAttackLogs,
      getAttackStats
};
