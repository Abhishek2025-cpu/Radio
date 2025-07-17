const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: file.fieldname === 'video' ? 'app-banners/videos' : 'app-banners/images',
    resource_type: file.fieldname === 'video' ? 'video' : 'image'
  })
});

const bannerupload = multer({ storage });

module.exports = bannerupload;
