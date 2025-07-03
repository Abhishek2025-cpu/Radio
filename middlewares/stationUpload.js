const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinaryConfig = require('../utils/cloudinary'); 

// This storage configuration can be reused for both single and multiple uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig.cloudinary, 
  params: {
    // We can even use a function to dynamically set the folder based on the field name
    folder: (req, file) => {
      if (file.fieldname === 'thumbnail') {
        return 'station-thumbnails'; // Folder for main thumbnails
      }
      if (file.fieldname === 'coverOverrideImage') {
        return 'song-covers'; // A separate folder for song covers
      }
      return 'misc-uploads'; // A fallback folder
    },
    allowed_formats: ['jpeg', 'jpg', 'png'],
  }
});

// We only need ONE multer instance, which we can then use with .single() or .fields() in our routes
const uploader = multer({ storage: storage });

module.exports = uploader;