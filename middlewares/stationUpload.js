const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary'); // Import your configured Cloudinary

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'station-thumbnails', // A specific folder for these images
    allowed_formats: ['jpeg', 'jpg', 'png'],
    // You can add transformations here if you want to resize images on upload
    // transformation: [{ width: 300, height: 300, crop: 'limit' }]
  }
});

// Create and export the Multer instance configured for thumbnails
const stationThumbnailUploader = multer({ storage: storage });

module.exports = stationThumbnailUploader;