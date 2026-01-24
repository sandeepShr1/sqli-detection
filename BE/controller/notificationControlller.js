const db = require('../db/models');
const Notification = db.notifications;
const catchAsyncError = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Backend: Express.js - SSE for admin notifications
const sseClients = [];

// SSE endpoint for admin real-time notifications
const getNotificationAlert = catchAsyncError(async (req, res) => {
      console.log('🔵 SSE endpoint hit');
      console.log('📊 Request query:', req.query);
      console.log('📊 Request user:', req.user ? { id: req.user.id, userType: req.user.userType } : 'No user');

      // Support token from query parameter (for EventSource compatibility)
      // Since EventSource doesn't support custom headers, we allow token in query
      const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');

      if (token && !req.user) {
            // If token is in query but user is not authenticated,
            // this means the protect middleware didn't run or failed
            console.error('❌ Token present but user not authenticated');
            return res.status(401).json({
                  success: false,
                  message: "Authentication required"
            });
      }

      // Check if user is admin (userType "2" is admin based on the schema)
      if (!req.user || req.user.userType !== "0") {
            console.error('❌ User is not admin. UserType:', req.user?.userType);
            return res.status(403).json({
                  success: false,
                  message: "Access denied. Admin only."
            });
      }

      console.log('✅ Admin authenticated, setting up SSE connection');

      // Set SSE headers
      res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no' // Disable buffering for nginx
      });

      // Store the response object in clients array
      const clientId = Date.now();
      sseClients.push({ id: clientId, res, userId: req.user.id });

      console.log(`✅ Admin SSE connected: ${req.user.email || req.user.id} (Total clients: ${sseClients.length})`);

      // Send initial connection message
      res.write(`data: ${JSON.stringify({
            type: 'CONNECTION',
            message: 'Connected to admin notification stream',
            timestamp: new Date().toISOString()
      })}\n\n`);

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
            sseClients.forEach((client, index) => {
                  try {
                        client.res.write(`:heartbeat ${new Date().toISOString()}\n\n`);
                  } catch (error) {
                        console.log(`❌ Heartbeat failed for client ${client.id}, removing`);
                        sseClients.splice(index, 1);
                  }
            });

            if (sseClients.length === 0) {
                  clearInterval(heartbeat);
            }
      }, 30000);

      // Clean up on client disconnect
      req.on('close', () => {
            clearInterval(heartbeat);
            const index = sseClients.findIndex(c => c.id === clientId);
            if (index !== -1) {
                  sseClients.splice(index, 1);
                  console.log(`❌ Admin SSE disconnected: ${req.user.email || req.user.id} (Remaining clients: ${sseClients.length})`);
            }
      });
});

// Create a new notification
const createNotification = catchAsyncError(async (req, res, next) => {
      const { userId, message, type } = req.body;

      if (!userId || !message || !type) {
            return next(new AppError("userId, message, and type are required", 400));
      }

      const notification = await Notification.create({
            userId,
            message,
            type,
            read: false,
      });

      return res.status(201).json({
            success: true,
            data: notification
      });
});

// Get all notifications (optionally filter by userId)
const getAllNotifications = catchAsyncError(async (req, res, next) => {
      const { userId, read } = req.query;

      const whereClause = {};
      if (userId) whereClause.userId = userId;
      if (read !== undefined) whereClause.read = read === 'true';

      const notifications = await Notification.findAll({
            where: whereClause,
            include: [{
                  model: db.user,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'email', "userType"]
            }],
            order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
      });
});

// Get notifications for a specific user
const getUserNotifications = catchAsyncError(async (req, res, next) => {
      const { userId } = req.params;

      if (!userId) {
            return next(new AppError("User ID is required", 400));
      }

      const notifications = await Notification.findAll({
            where: { userId },
            include: [{
                  model: db.user,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'email']
            }],
            order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
      });
});

// Get unread notifications for a user
const getUnreadNotifications = catchAsyncError(async (req, res, next) => {
      const { userId } = req.params;

      if (!userId) {
            return next(new AppError("User ID is required", 400));
      }

      const notifications = await Notification.findAll({
            where: {
                  userId,
                  read: false
            },
            include: [{
                  model: db.user,
                  as: 'user',
                  attributes: ['id', 'username', 'email']
            }],
            order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
            success: true,
            count: notifications.length,
            notifications
      });
});

// Mark notification as read
const markAsRead = catchAsyncError(async (req, res, next) => {
      const { id } = req.params;

      const notification = await Notification.findByPk(id);

      if (!notification) {
            return next(new AppError('Notification not found', 404));
      }

      await notification.update({ read: true });

      res.status(200).json({
            success: true,
            data: notification
      });
});

// Mark all notifications as read for a user
const markAllAsRead = catchAsyncError(async (req, res, next) => {
      const { userId } = req.params;

      if (!userId) {
            return next(new AppError("User ID is required", 400));
      }

      await Notification.update(
            { read: true },
            { where: { userId, read: false } }
      );

      res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
      });
});

// Delete a notification
const deleteNotification = catchAsyncError(async (req, res, next) => {
      const { id } = req.params;

      const result = await Notification.destroy({ where: { id } });

      if (!result) {
            return next(new AppError('Notification not found', 404));
      }

      res.status(200).json({
            success: true,
            message: 'Notification deleted successfully'
      });
});

// Delete all notifications for a user
const deleteAllUserNotifications = catchAsyncError(async (req, res, next) => {
      const { userId } = req.params;

      if (!userId) {
            return next(new AppError("User ID is required", 400));
      }

      const result = await Notification.destroy({ where: { userId } });

      res.status(200).json({
            success: true,
            message: `${result} notification(s) deleted successfully`
      });
});

module.exports = {
      createNotification,
      getAllNotifications,
      getUserNotifications,
      getUnreadNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteAllUserNotifications,
      getNotificationAlert,
      sseClients
};
