const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary'); // Direct cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'station-thumbnails',
    allowed_formats: ['jpeg', 'jpg', 'png'],
  }
});

const stationThumbnailUploader = multer({ storage });

module.exports = stationThumbnailUploader;
