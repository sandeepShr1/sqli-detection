const {
      getAllProducts,
      addProduct,
      updateProduct,
      patchProduct,
      getAProducts,
      deleteProduct,
      getAdminProducts,
      createProductReview,
      getProductReviews,
      deleteReview
} = require('../controller/productController');
const uploadProduct = require('../middleware/uploadProduct.middleware');
const { protect } = require('../middleware/auth.middleware');
const sqlDetectionMiddleware = require('../middleware/sqliDetection.middleware');

const router = require('express').Router();

// Public routes (search has SQL detection)
router.route("/").get(sqlDetectionMiddleware, getAllProducts);
router.route("/product/:id").get(sqlDetectionMiddleware, getAProducts);
router.route("/reviews").get(getProductReviews);

// User routes (protected, with SQL detection for review submission)
router.route("/review").put(protect, sqlDetectionMiddleware, createProductReview);

// Admin routes (with SQL detection for product creation/updates)
router.route("/admin/products").get(protect, getAdminProducts);
router.route("/admin/review").delete(protect, sqlDetectionMiddleware, deleteReview);
router.route("/new").post(protect, sqlDetectionMiddleware, uploadProduct.array('images', 5), addProduct);
router.route("/update/:id").put(protect, sqlDetectionMiddleware, uploadProduct.array('images', 5), updateProduct);
router.route("/patch/:id").patch(protect, sqlDetectionMiddleware, patchProduct);
router.route("/delete/:id").delete(protect, deleteProduct);

module.exports = router;