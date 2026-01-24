const { getAllAttackLogs, getAttackStats } = require('../controller/attackLogController');
const { protect } = require('../middleware/auth.middleware');
const sqlDetectionMiddleware = require('../middleware/sqliDetection.middleware');

const router = require('express').Router();

// Admin only routes - to view attack logs
router.route("/admin/attacks").get(protect, getAllAttackLogs);
router.route("/admin/attacks/stats").get(protect, getAttackStats);

module.exports = router;
