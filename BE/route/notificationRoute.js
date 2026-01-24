const express = require('express');
const {
      createNotification,
      getAllNotifications,
      getUserNotifications,
      getUnreadNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllUserNotifications,
      getNotificationAlert
} = require('../controller/notificationControlller');
const { protect } = require('../middleware/auth.middleware');
const sqlDetectionMiddleware = require('../middleware/sqliDetection.middleware');

const router = express.Router();

// Create a new notification (protected route)
router.post('/create', protect, sqlDetectionMiddleware, createNotification);

// Get all notifications with optional filters (admin route)
router.get('/all', protect, getAllNotifications);

// Get all notifications for a specific user
router.get('/user/:userId', protect, getUserNotifications);

// Get unread notifications for a specific user
router.get('/user/:userId/unread', protect, getUnreadNotifications);

// Mark a specific notification as read
router.patch('/:id/read', protect, markAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userId/read-all', protect, markAllAsRead);

// Delete a specific notification
router.delete('/:id', protect, deleteNotification);

// Delete all notifications for a user
router.delete('/user/:userId/all', protect, deleteAllUserNotifications);

// SSE endpoint for admin real-time notifications
router.get('/admin/events', protect, getNotificationAlert);

module.exports = router;
