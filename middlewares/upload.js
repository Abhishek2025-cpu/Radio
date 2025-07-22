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


const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'form-audios',
    resource_type: 'video', // important: treat audio as video
    format: path.extname(file.originalname).slice(1), // ensure file extension is used correctly
    public_id: Date.now() + '-' + path.parse(file.originalname).name,
  }),
});



const fileFilterAudio = (req, file, cb) => {
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only mp3, wav, ogg, m4a files are allowed.'));
  }
};


const uploadAudio = multer({
  storage: audioStorage,
  fileFilter: fileFilterAudio,
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

module.exports = { uploadStation, uploadGenre, uploadAudio };
