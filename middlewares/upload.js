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


const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const isVideo = file.mimetype.startsWith('video');
    return {
      folder: 'game-participations',
      resource_type: isVideo ? 'video' : 'image',
      format: path.extname(file.originalname).slice(1),
      public_id: Date.now() + '-' + path.parse(file.originalname).name,
    };
  },
});

const fileFilterMedia = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/jpg',
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and video files are allowed.'));
  }
};

const uploadMedia = multer({
  storage: mediaStorage,
  fileFilter: fileFilterMedia,
  limits: {
    fileSize: 50 * 1024 * 1024 // optional: max 50MB
  }
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

module.exports = { uploadStation, uploadGenre, uploadAudio, uploadMedia };
