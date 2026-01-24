const {
      createOrder,
      getSingleOrder,
      myOrders,
      getAllOrders,
      updateOrder,
      deleteOrder
} = require('../controller/orderController');
const { protect } = require('../middleware/auth.middleware');
const sqlDetectionMiddleware = require('../middleware/sqliDetection.middleware');

const router = require('express').Router();

// User routes (with SQL detection for order creation)
router.route("/new").post(protect, sqlDetectionMiddleware, createOrder);
router.route("/order/:id").get(protect, getSingleOrder);
router.route("/orders/me").get(protect, myOrders);

// Admin routes (with SQL detection for order updates)
router.route("/admin/orders").get(protect, getAllOrders);
router.route("/admin/order/:id")
      .put(protect, sqlDetectionMiddleware, updateOrder)
      .delete(protect, deleteOrder);

module.exports = router;
