// In utils/uploadToCloudinary.js

const cloudinary = require('./cloudinary');
const streamifier = require('streamifier');

const uploadToCloudinary = (fileBuffer, originalMimetype) => {
  return new Promise((resolve, reject) => {
    let folder = 'news_media/misc';
    if (originalMimetype.startsWith('image/')) {
      folder = 'news_media/images';
    } else if (originalMimetype.startsWith('audio/')) {
      folder = 'news_media/audio';
    } else if (originalMimetype.startsWith('video/')) {
      folder = 'news_media/videos';
    }

    const uploadOptions = {
      folder: folder,
      resource_type: 'auto'
    };

    const uploadCallback = (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, uploadCallback);
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};


// --- THIS IS THE FIX ---
// WRONG: module.exports = uploadToCloudinary;
// CORRECT: Export an object containing the function.
module.exports = {
  uploadToCloudinary
};