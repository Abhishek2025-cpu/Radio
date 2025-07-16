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
const cloudinary = require('../utils/cloudinary'); // Single source of truth

const stationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stations',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const genreStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'genres',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) return cb(null, true);
  cb(new Error('Only jpeg, jpg, png files allowed.'));
};

const uploadStation = multer({ storage: stationStorage, fileFilter });
const uploadGenre = multer({ storage: genreStorage, fileFilter });

module.exports = { uploadStation, uploadGenre };

