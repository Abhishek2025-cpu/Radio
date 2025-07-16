const cloudinary = require('../utils/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

const stationStorage = new CloudinaryStorage({
  cloudinary, // Now it's the correct pure instance
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
