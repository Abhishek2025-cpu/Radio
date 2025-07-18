// In utils/uploadToCloudinary.js

const cloudinary = require('./cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The buffer of the file to upload.
 * @param {string} originalMimetype - The original MIME type of the file (e.g., 'image/jpeg').
 * @returns {Promise<object>} A promise that resolves with the Cloudinary upload result.
 */
const uploadToCloudinary = (fileBuffer, originalMimetype) => {
  return new Promise((resolve, reject) => {
    // Determine the folder based on the mimetype string
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
        console.error('Cloudinary Upload Error:', error);
        return reject(error);
      }
      resolve(result);
    };

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, uploadCallback);
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Ensure you are exporting an object containing the function
module.exports = {
  uploadToCloudinary
};