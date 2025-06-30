const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// Load credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer The file buffer from req.file.buffer.
 * @param {String} mimetype The file's mimetype from req.file.mimetype.
 * @returns {Promise<Object>} A promise that resolves with the Cloudinary upload result.
 */
const uploadToCloudinary = (input, mimetype, isPath = false) => {
  return new Promise((resolve, reject) => {
    let folder = 'news_media/misc';
    if (mimetype?.startsWith('image/')) folder = 'news_media/images';
    else if (mimetype?.startsWith('audio/')) folder = 'news_media/audio';
    else if (mimetype?.startsWith('video/')) folder = 'news_media/videos';

    const uploadOptions = {
      folder,
      resource_type: 'auto',
    };

    const callback = (error, result) => {
      if (error) {
        console.error("Cloudinary Upload Error:", error);
        reject(error);
      } else {
        resolve(result);
      }
    };

    if (isPath) {
      cloudinary.uploader.upload(input, uploadOptions, callback);
    } else {
      const stream = cloudinary.uploader.upload_stream(uploadOptions, callback);
      streamifier.createReadStream(input).pipe(stream);
    }
  });
};


// Export only after initialization
module.exports = { cloudinary, uploadToCloudinary };
