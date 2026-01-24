const {
      signup,
      login,
      getUserDetails,
      logout,
      updatePassword,
      updateProfile,
      getAllUsers,
      getSingleUser,
      updateUserRole,
      deleteUser,
      forgotPassword,
      resetPassword
} = require('../controller/authController');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const sqlDetectionMiddleware = require('../middleware/sqliDetection.middleware');

const router = require('express').Router();

// Public routes (with SQL injection detection)
router.route("/signup").post(sqlDetectionMiddleware, upload.single('avatar'), signup);
router.route("/signin").post(sqlDetectionMiddleware, login);
router.route("/password/forgot").post(sqlDetectionMiddleware, forgotPassword);
router.route("/password/reset/:token").put(resetPassword);

// Protected user routes (with SQL injection detection for updates)
router.route("/me").get(protect, getUserDetails);
router.route("/logout").get(protect, logout);
router.route("/password/update").put(protect, sqlDetectionMiddleware, updatePassword);
router.route("/me/update").put(protect, sqlDetectionMiddleware, upload.single('avatar'), updateProfile);

// Admin routes
router.route("/admin/users").get(protect, getAllUsers);
router.route("/admin/user/:id")
      .get(protect, getSingleUser)
      .put(protect, sqlDetectionMiddleware, updateUserRole)
      .delete(protect, deleteUser);

module.exports = router;