// utils/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary'); // configured Cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stations',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});



const upload = multer({ storage });
module.exports = upload;

