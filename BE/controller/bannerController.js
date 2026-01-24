const db = require("../db/models");
const Banner = db.banners;
const BannerImage = db.banner_images;
const cloudinary = require("../config/cloudinary");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsync");

// Create banner - Admin only
const createBanner = catchAsyncError(async (req, res, next) => {
      const {
            buttonText,
            product,
            desc,
            smallText,
            midText,
            largeText1,
            largeText2,
            discount
      } = req.body;

      // Create banner
      const banner = await Banner.create({
            buttonText,
            product,
            desc,
            smallText,
            midText,
            largeText1,
            largeText2,
            discount: discount || 0
      });

      // Handle multiple image uploads
      const uploadedImages = [];
      if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                  const file = req.files[i];
                  const bannerImage = await BannerImage.create({
                        bannerId: banner.id,
                        url: file.path,
                        public_id: file.filename
                  });
                  uploadedImages.push(bannerImage);
            }
      }

      res.status(201).json({
            success: true,
            banner: {
                  ...banner.toJSON(),
                  images: uploadedImages
            }
      });
});

// Get all banners
const getBanners = catchAsyncError(async (req, res, next) => {
      const banners = await Banner.findAll({
            include: [{
                  model: BannerImage,
                  as: 'images'
            }],
            order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
            success: true,
            banners
      });
});

// Get single banner - Admin
const getSingleBanner = catchAsyncError(async (req, res, next) => {
      const banner = await Banner.findByPk(req.params.id, {
            include: [{
                  model: BannerImage,
                  as: 'images'
            }]
      });

      if (!banner) {
            return next(new AppError("Banner not found", 404));
      }

      res.status(200).json({
            success: true,
            banner
      });
});

// Update banner - Admin
const updateBanner = catchAsyncError(async (req, res, next) => {
      let banner = await Banner.findByPk(req.params.id, {
            include: [{
                  model: BannerImage,
                  as: 'images'
            }]
      });

      if (!banner) {
            return next(new AppError("Banner not found", 404));
      }

      // Update banner fields
      const {
            buttonText,
            product,
            desc,
            smallText,
            midText,
            largeText1,
            largeText2,
            discount
      } = req.body;

      await banner.update({
            buttonText,
            product,
            desc,
            smallText,
            midText,
            largeText1,
            largeText2,
            discount
      });

      // Handle new image uploads
      const uploadedImages = [];
      if (req.files && req.files.length > 0) {
            // Delete old images from cloudinary
            for (const image of banner.images) {
                  try {
                        await cloudinary.uploader.destroy(image.public_id);
                        await BannerImage.destroy({ where: { id: image.id } });
                  } catch (error) {
                        console.error('Error deleting image:', error);
                  }
            }

            // Upload new images
            for (let i = 0; i < req.files.length; i++) {
                  const file = req.files[i];
                  const bannerImage = await BannerImage.create({
                        bannerId: banner.id,
                        url: file.path,
                        public_id: file.filename
                  });
                  uploadedImages.push(bannerImage);
            }
      }

      // Fetch updated banner with images
      const updatedBanner = await Banner.findByPk(req.params.id, {
            include: [{
                  model: BannerImage,
                  as: 'images'
            }]
      });

      res.status(200).json({
            success: true,
            banner: updatedBanner
      });
});

// Delete banner - Admin
const deleteBanner = catchAsyncError(async (req, res, next) => {
      const banner = await Banner.findByPk(req.params.id, {
            include: [{
                  model: BannerImage,
                  as: 'images'
            }]
      });

      if (!banner) {
            return next(new AppError("Banner not found", 404));
      }

      // Delete banner images from cloudinary
      for (const image of banner.images) {
            try {
                  await cloudinary.uploader.destroy(image.public_id);
            } catch (error) {
                  console.error('Error deleting image from cloudinary:', error);
            }
      }

      // Delete banner (will cascade delete banner_images)
      await banner.destroy();

      res.status(200).json({
            success: true,
            message: "Banner removed successfully"
      });
});

module.exports = {
      createBanner,
      getBanners,
      getSingleBanner,
      updateBanner,
      deleteBanner
};
