const {
      createBanner,
      getBanners,
      getSingleBanner,
      updateBanner,
      deleteBanner
} = require('../controller/bannerController');
const { protect } = require('../middleware/auth.middleware');
const uploadProduct = require('../middleware/uploadProduct.middleware');
const sqlDetectionMiddleware = require('../middleware/sqliDetection.middleware');

const router = require('express').Router();

// Public route
router.route("/").get(getBanners);

// Admin routes (with SQL detection for banner creation/updates)
router.route("/admin/banner")
      .post(protect, sqlDetectionMiddleware, uploadProduct.array('images', 3), createBanner);

router.route("/admin/banner/:id")
      .get(protect, getSingleBanner)
      .put(protect, sqlDetectionMiddleware, uploadProduct.array('images', 3), updateBanner)
      .delete(protect, sqlDetectionMiddleware, deleteBanner);

module.exports = router;
