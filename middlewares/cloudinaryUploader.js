// middlewares/cloudinaryUploader.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary with your credentials from .env
// This should only be done once in your project
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Creates a multer upload middleware for a specific resource type.
 * @param {string} folderName - The name of the folder to store files in on Cloudinary.
 * @returns A multer instance configured for Cloudinary.
 */
const createUploader = (folderName) => {
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      // You can add transformations here if needed
      // transformation: [{ width: 500, height: 500, crop: 'limit' }]
    },
  });

  return multer({ storage: storage });
};

// Export specific uploaders for different parts of your app
module.exports = {
  podcastUploader: createUploader('podcasts'),
  artistUploader: createUploader('artists'),
  // Add more as needed...
};