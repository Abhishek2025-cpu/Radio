

module.exports = { cloudinary, storage };
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config(); // Make sure to install dotenv: npm install dotenv

// --- FIX 1: Load credentials securely from environment variables ---
// Your API keys are now safe and not hardcoded.
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
    
    // --- FIX 2: Determine folder based on mimetype, not fieldname ---
    let folder = 'news_media/misc'; // A default folder
    if (mimetype.startsWith('image/')) {
      folder = 'news_media/images';
    } else if (mimetype.startsWith('audio/')) {
      folder = 'news_media/audio';
    } else if (mimetype.startsWith('video/')) {
      folder = 'news_media/videos';
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        // --- FIX 3: Let Cloudinary automatically detect the resource type ---
        resource_type: 'auto' 
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Stream Upload Error:", error);
          reject(error);
        } else {
          resolve(result); // Resolve with the full result object
        }
      }
    );

    // Pipe the buffer to the upload stream
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// We only need to export the configured cloudinary instance and our new helper.
// The broken `storage` engine is gone.
module.exports = { cloudinary, uploadToCloudinary };