const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. We import the entire object you exported { cloudinary, uploadToCloudinary }
//    Let's rename it to be clear about what it is.
const cloudinaryConfig = require('../utils/cloudinary'); 

// Configure Multer to use Cloudinary for storage
const storage = new CloudinaryStorage({
  // 2. THE FIX: Instead of passing the whole object, we pass the 'cloudinary' property from it.
  cloudinary: cloudinaryConfig.cloudinary, 
  
  params: {
    folder: 'station-thumbnails',
    allowed_formats: ['jpeg', 'jpg', 'png'],
  }
});

// Create and export the Multer instance. This part doesn't change.
const stationThumbnailUploader = multer({ storage: storage });

module.exports = stationThumbnailUploader;