const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
            folder: 'products',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      },
});

const uploadProduct = multer({
      storage: storage,
      limits: {
            fileSize: 10 * 1024 * 1024, // 10MB limit per file
      },
      fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                  cb(null, true);
            } else {
                  cb(new Error('Only image files are allowed!'), false);
            }
      },
});

module.exports = uploadProduct;
