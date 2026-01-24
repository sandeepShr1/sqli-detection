const db = require("../db/models");
const Products = db.products;
const Image = db.images;
const Review = db.reviews;
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsync");
const { isEqual } = require("../utils/jsUtilityFunc");
const { Op } = require('sequelize');

const getAllProducts = catchAsyncError(async (req, res, next) => {
      try {
            const resultPerPage = 8;
            const page = Number(req.query.page) || 1;
            const keyword = req.query.keyword || "";
            const category = req.query.category;
            const minPrice = Number(req.query['price[gte]']) || 0;
            const maxPrice = Number(req.query['price[lte]']) || 1000000;
            const minRating = Number(req.query['ratings[gte]']) || 0;

            // Build where clause
            const whereClause = {
                  price: { [Op.between]: [minPrice, maxPrice] },
                  rating: { [Op.gte]: minRating }
            };

            if (keyword) {
                  whereClause.name = { [Op.iLike]: `%${keyword}%` };
            }

            if (category && category !== 'All') {
                  whereClause.category = { [Op.iLike]: category };
            }

            // Get total count for this filter
            const filteredProductsCount = await Products.count({ where: whereClause });

            // Get total count
            const productsCount = await Products.count();

            // Get paginated products
            const products = await Products.findAll({
                  where: whereClause,
                  include: [{
                        model: Image,
                        as: 'images'
                  }],
                  limit: resultPerPage,
                  offset: (page - 1) * resultPerPage,
                  order: [['createdAt', 'DESC']]
            });

            res.status(200).json({
                  success: true,
                  data: products,
                  productsCount,
                  resultPerPage,
                  filteredProductsCount
            })
      } catch (error) {
            return next(new AppError(error.message, 500))
      }
})
const getAProducts = catchAsyncError(async (req, res, next) => {
      try {
            const { id } = req.params;
            const product = await Products.findByPk(id, {
                  include: [{
                        model: Image,
                        as: 'images'
                  }]
            });
            if (!product) {
                  return next(new AppError("Product not found", 404))
            }

            // Get similar products (same category, exclude current product)
            const similarProducts = await Products.findAll({
                  where: {
                        category: product.category,
                        id: { [Op.ne]: id }
                  },
                  include: [{
                        model: Image,
                        as: 'images'
                  }],
                  limit: 4,
                  order: [['rating', 'DESC']]
            });

            res.status(200).json({
                  success: true,
                  product: product,
                  similarProducts: similarProducts
            })
      } catch (error) {
            return next(new AppError(error.message, 500))
      }
})

const deleteProduct = catchAsyncError(async (req, res, next) => {
      try {
            const { id } = req.params;

            const product = await Products.findByPk(id);

            if (!product) {
                  return next(new AppError("Product not found", 404))
            }
            await product.destroy();

            res.status(200).json({
                  success: true,
                  message: 'Product deleted successfully',
                  deletedProduct: {
                        id: product.id,
                        name: product.name
                  }
            })

      } catch (error) {
            return next(new AppError(error.message), 500)
      }
})

const addProduct = catchAsyncError(async (req, res, next) => {
      try {
            const { name, description, category, price, stock } = req.body;


            if (!name || !category || !price) {
                  return next(new AppError("Please fill all required fields.", 400))
            }

            // Create product
            const product = await Products.create({
                  name,
                  description,
                  price,
                  category,
                  stock: stock || 0,
            })

            // Handle multiple image uploads
            const uploadedImages = [];
            if (req.files && req.files.length > 0) {
                  for (let i = 0; i < req.files.length; i++) {
                        const file = req.files[i];
                        const image = await Image.create({
                              productId: product.id,
                              url: file.path,
                              public_id: file.filename,
                              secure_url: file.secure_url || file.path,
                              format: file.format,
                              width: file.width,
                              height: file.height,
                              isPrimary: i === 0 // First image is primary
                        });
                        uploadedImages.push(image);
                  }
            }

            res.status(201).json({
                  success: true,
                  message: "Product added successfully",
                  product: {
                        ...product.toJSON(),
                        images: uploadedImages
                  }
            })
      } catch (error) {
            return next(new AppError(error.message, 500))
      }
})

const updateProduct = catchAsyncError(async (req, res, next) => {
      try {
            const { id } = req.params;
            const updates = req.body;



            const product = await Products.findByPk(id);

            if (!product) {
                  return next(new AppError("Product not found", 400))
            }

            await product.update(updates);

            // Handle new image uploads
            const uploadedImages = [];
            if (req.files && req.files.length > 0) {
                  // Get existing images count to determine isPrimary
                  const existingImages = await Image.findAll({ where: { productId: id } });
                  const hasNoPrimaryImage = !existingImages.some(img => img.isPrimary);

                  for (let i = 0; i < req.files.length; i++) {
                        const file = req.files[i];
                        const image = await Image.create({
                              productId: product.id,
                              url: file.path,
                              public_id: file.filename,
                              secure_url: file.secure_url || file.path,
                              format: file.format,
                              width: file.width,
                              height: file.height,
                              isPrimary: hasNoPrimaryImage && i === 0
                        });
                        uploadedImages.push(image);
                  }
            }

            // Get all images for the product
            const allImages = await Image.findAll({ where: { productId: id } });

            res.status(200).json({
                  success: true,
                  message: "Product updated successfully",
                  product: {
                        ...product.toJSON(),
                        images: allImages
                  }
            })

      } catch (error) {
            return next(new AppError(error.message, 500))
      }
})

const patchProduct = catchAsyncError(async (req, res, next) => {
      try {
            const { id } = req.params;
            const updates = req.body;

            // Check if body is empty
            if (Object.keys(updates).length === 0) {
                  return next(new AppError("No fields to update", 400))
            }

            const allowedFields = ['name', 'description', "price", "category", "stock", "rating", "numOfReviews"]

            const product = await Products.findByPk(id);

            if (!product) {
                  return next(new AppError("Product not found", 404))
            }

            // track what actually changed
            const changedFields = {}
            const unchangedFields = []

            allowedFields.forEach((field) => {
                  // only process if fields is in request body
                  if (updates.hasOwnProperty(field)) {
                        const oldValue = product[field];
                        const newValue = updates[field];

                        // compare values
                        const isChanged = !isEqual(oldValue, newValue)
                        if (isChanged) {
                              changedFields[field] = {
                                    old: oldValue,
                                    new: newValue
                              }
                        } else {
                              unchangedFields.push(field)
                        }
                  }
            })

            //If nothing actually changed
            if (Object.keys(changedFields).length === 0) {
                  return res.status(200).json({
                        success: true,
                        message: 'No changes detected',
                        data: product,
                        unchangedFields
                  });
            }

            //Extract only new values to update
            const fieldsToUpdate = {}
            Object.keys(changedFields).forEach(field => {
                  fieldsToUpdate[field] = changedFields[field].new
            })
            await product.update(fieldsToUpdate)
            res.status(200).json({
                  success: true,
                  message: "Product updated successfully",
                  data: product
            })
      } catch (error) {
            return next(new AppError(error.message, 500))
      }
})

// Admin - Get all products without pagination
const getAdminProducts = catchAsyncError(async (req, res, next) => {
      try {
            const products = await Products.findAll({
                  include: [{
                        model: Image,
                        as: 'images'
                  }],
                  order: [['createdAt', 'DESC']]
            });

            res.status(200).json({
                  success: true,
                  products: products
            })
      } catch (error) {
            return next(new AppError(error.message, 500))
      }
})

// Create or Update Product Review
const createProductReview = catchAsyncError(async (req, res, next) => {

      try {
            const { rating, comment, productId } = req.body;

            if (!rating || !comment || !productId) {
                  return next(new AppError("Please provide rating, comment, and productId", 400));
            }

            const product = await Products.findByPk(productId, {
                  include: [{
                        model: Review,
                        as: 'reviews'
                  }]
            });

            if (!product) {
                  return next(new AppError("Product not found", 404));
            }

            // Check if user already reviewed
            const existingReview = await Review.findOne({
                  where: {
                        userId: req.user.id,
                        productId: productId
                  }
            });

            if (existingReview) {
                  // Update existing review
                  existingReview.rating = Number(rating);
                  existingReview.comment = comment;
                  existingReview.name = `${req.user.firstName} ${req.user.lastName}`;
                  await existingReview.save();
            } else {
                  // Create new review
                  await Review.create({
                        userId: req.user.id,
                        productId: productId,
                        name: `${req.user.firstName} ${req.user.lastName}`,
                        rating: Number(rating),
                        comment: comment
                  });
            }

            // Recalculate product rating
            const allReviews = await Review.findAll({
                  where: { productId: productId }
            });

            const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
            product.rating = totalRating / allReviews.length;
            product.numOfReviews = allReviews.length;
            await product.save();

            res.status(200).json({
                  success: true,
                  message: "Review submitted successfully"
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Get all reviews for a product
const getProductReviews = catchAsyncError(async (req, res, next) => {
      try {
            const { id } = req.query;

            if (!id) {
                  return next(new AppError("Product ID is required", 400));
            }

            const product = await Products.findByPk(id);

            if (!product) {
                  return next(new AppError("Product not found", 404));
            }

            const reviews = await Review.findAll({
                  where: { productId: id },
                  include: [{
                        model: db.user,
                        as: 'user',
                        attributes: ['id', 'firstName', 'lastName', 'email']
                  }],
                  order: [['createdAt', 'DESC']]
            });

            res.status(200).json({
                  success: true,
                  reviews: reviews
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Delete a review (Admin)
const deleteReview = catchAsyncError(async (req, res, next) => {
      try {
            const { id, productId } = req.query;

            if (!id || !productId) {
                  return next(new AppError("Review ID and Product ID are required", 400));
            }

            const review = await Review.findByPk(id);

            if (!review) {
                  return next(new AppError("Review not found", 404));
            }

            await review.destroy();

            // Recalculate product rating
            const product = await Products.findByPk(productId);
            const allReviews = await Review.findAll({
                  where: { productId: productId }
            });

            if (allReviews.length > 0) {
                  const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
                  product.rating = totalRating / allReviews.length;
                  product.numOfReviews = allReviews.length;
            } else {
                  product.rating = 0;
                  product.numOfReviews = 0;
            }

            await product.save();

            res.status(200).json({
                  success: true,
                  message: "Review deleted successfully"
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

module.exports = {
      getAllProducts,
      getAProducts,
      deleteProduct,
      addProduct,
      patchProduct,
      updateProduct,
      getAdminProducts,
      createProductReview,
      getProductReviews,
      deleteReview
}