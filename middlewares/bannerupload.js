const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    if (file.fieldname === 'video') {
      return { folder: 'app-banners/videos', resource_type: 'video' };
    }
    return { folder: 'app-banners/images', resource_type: 'image' };
  }
});

const bannerupload = multer({ storage });

module.exports = bannerupload;
