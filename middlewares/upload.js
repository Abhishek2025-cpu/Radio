// // utils/multer.js
// const multer = require('multer');
// const { CloudinaryStorage } = require('multer-storage-cloudinary');
// const cloudinary = require('../utils/cloudinary'); // configured Cloudinary instance

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: {
//     folder: 'stations',
//     allowed_formats: ['jpg', 'jpeg', 'png'],
//   },
// });



// const upload = multer({ storage });
// module.exports = upload;

// utils/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const cloudinary = require('../utils/cloudinary'); // Your existing configured Cloudinary instance
const cloudinaryConfig = require('../config/cloudinary'); // If needed for the second config

// Default storage: stations folder
const stationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stations',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// Genre storage: genres folder with file filter
const genreStorage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig, // Explicit config if needed
  params: {
    folder: 'genres',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

// File filter logic (optional but reusable)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports jpeg, jpg, png.'));
};

// Export both upload middlewares separately
const uploadStation = multer({ storage: stationStorage });
const uploadGenre = multer({ storage: genreStorage, fileFilter });

module.exports = {
  uploadStation,
  uploadGenre,
};
