const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

// Load credentials from .env
cloudinary.config({
  cloud_name: 'dvumlrxml',
  api_key: '437932967899129',
  api_secret: 'Pg4zI1EW8iCdotG29P4jcHFAW4s',
});

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer The file buffer from req.file.buffer.
 * @param {String} mimetype The file's mimetype from req.file.mimetype.
 * @returns {Promise<Object>} A promise that resolves with the Cloudinary upload result.
 */
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    let folder = 'news_media/misc';
    if (mimetype.startsWith('image/')) {
      folder = 'news_media/images';
    } else if (mimetype.startsWith('audio/')) {
      folder = 'news_media/audio';
    } else if (mimetype.startsWith('video/')) {
      folder = 'news_media/videos';
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Stream Upload Error:", error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Export only after initialization
module.exports = { cloudinary, uploadToCloudinary };
