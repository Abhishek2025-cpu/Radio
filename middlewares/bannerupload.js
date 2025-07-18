const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

/**
 * Creates a configured Multer instance for banner uploads.
 * @param {string} bannerType - The type of banner, used to determine the Cloudinary folder. e.g., 'app' or 'site'.
 * @returns {multer.Instance} A configured multer instance ready to be used as middleware.
 */
const createUploader = (bannerType) => {
  // We can add a check to ensure a type is always passed, preventing errors.
  if (!bannerType || (bannerType !== 'app' && bannerType !== 'site')) {
    throw new Error('A valid banner type ("app" or "site") must be provided to the uploader.');
  }

  const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      // Use the bannerType to create dynamic folder paths
      const folderPath = `${bannerType}-banners`; // Result: "app-banners" or "site-banners"

      // Determine the subfolder based on the file type
      if (file.fieldname === 'video') {
        return {
          folder: `${folderPath}/videos`,
          resource_type: 'video'
        };
      }
      return {
        folder: `${folderPath}/images`,
        resource_type: 'image'
      };
    }
  });

  return multer({ storage });
};

// Export the function itself, not a pre-made instance.
module.exports = createUploader;


