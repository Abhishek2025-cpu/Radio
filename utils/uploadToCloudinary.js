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
    // Determine the folder based on the file's original MIME type.
    let folder = 'news_media/misc';
    if (originalMimetype.startsWith('image/')) {
      folder = 'news_media/images';
    } else if (originalMimetype.startsWith('audio/')) {
      folder = 'news_media/audio';
    } else if (originalMimetype.startsWith('video/')) {
      folder = 'news_media/videos';
    }

    // Set Cloudinary options. 'auto' is great for letting Cloudinary figure out the type.
    const uploadOptions = {
      folder: folder,
      resource_type: 'auto'
    };

    // The callback function handles the response from Cloudinary.
    const uploadCallback = (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return reject(new Error('Failed to upload file to Cloudinary.'));
      }
      resolve(result);
    };

    // Create a stream from the buffer and pipe it to Cloudinary's upload stream.
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, uploadCallback);
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

// Use a direct export, which is what your controller will now expect.
module.exports = uploadToCloudinary;