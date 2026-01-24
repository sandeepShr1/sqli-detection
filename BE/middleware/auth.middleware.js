// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const db = require('../db/models');
const User = db.user;

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
      try {
            let token;

            // 1. Check if token exists in Authorization header
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                  token = req.headers.authorization.split(' ')[1];

            }
            // 2. Check in query parameters (for SSE EventSource compatibility)
            else if (req.query && req.query.token) {
                  token = req.query.token;
            }
            // 3. Or check in cookies (alternative)
            else if (req.cookies && req.cookies.token) {
                  token = req.cookies.token;
            }

            // 4. Check if token exists
            if (!token) {
                  return next(new AppError('You are not logged in. Please log in to access.', 401));
            }

            // 3. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

            // 4. Check if user still exists
            const currentUser = await User.findByPk(decoded.id);

            if (!currentUser) {
                  return next(new AppError('The user belonging to this token no longer exists.', 401));
            }

            // 5. Grant access to protected route
            req.user = currentUser; // This sets req.user.id
            next();
      } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                  return next(new AppError('Invalid token. Please log in again.', 401));
            }
            if (error.name === 'TokenExpiredError') {
                  return next(new AppError('Your token has expired. Please log in again.', 401));
            }
            return next(new AppError(error.message, 500));
      }
};

// Restrict to specific roles
exports.restrictTo = (...roles) => {
      return (req, res, next) => {
            // roles is an array like ['admin', 'seller']
            if (!roles.includes(req.user.role)) {
                  return next(new AppError('You do not have permission to perform this action', 403));
            }
            next();
      };
};