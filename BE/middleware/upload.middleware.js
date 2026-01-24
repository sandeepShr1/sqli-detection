const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
            folder: 'avatars',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
      },
});

const upload = multer({
      storage: storage,
      limits: {
            fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith('image/')) {
                  cb(null, true);
            } else {
                  cb(new Error('Only image files are allowed!'), false);
            }
      },
});

module.exports = upload;
