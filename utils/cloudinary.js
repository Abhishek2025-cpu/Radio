// const cloudinary = require('cloudinary').v2;
// const streamifier = require('streamifier');
// require('dotenv').config();

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// /**
//  * Uploads a file to Cloudinary using either buffer or file path.
//  * @param {Buffer | String} file - The buffer or path to the file.
//  * @param {String} mimetype - The file's mimetype.
//  * @param {Boolean} usePath - Whether to upload using the file path instead of buffer.
//  * @returns {Promise<Object>} A promise that resolves with the Cloudinary upload result.
//  */
// const uploadToCloudinary = (file, mimetype, usePath = false) => {
//   return new Promise((resolve, reject) => {
//     let folder = 'news_media/misc';
//     if (mimetype.startsWith('image/')) {
//       folder = 'news_media/images';
//     } else if (mimetype.startsWith('audio/')) {
//       folder = 'news_media/audio';
//     } else if (mimetype.startsWith('video/')) {
//       folder = 'news_media/videos';
//     }

//     const options = {
//       folder,
//       resource_type: 'auto',
//     };

//     if (usePath) {
//       // Upload using file path
//       cloudinary.uploader.upload(file, options, (error, result) => {
//         if (error) {
//           console.error('Cloudinary Path Upload Error:', error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       });
//     } else {
//       // Upload using buffer stream
//       const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
//         if (error) {
//           console.error('Cloudinary Stream Upload Error:', error);
//           reject(error);
//         } else {
//           resolve(result);
//         }
//       });

//       streamifier.createReadStream(file).pipe(uploadStream);
//     }
//   });
// };

// module.exports = { cloudinary, uploadToCloudinary };


const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (file, mimetype, usePath = false) => {
  return new Promise((resolve, reject) => {
    let folder = 'news_media/misc'; // Default folder
    if (mimetype.startsWith('image/')) {
      folder = 'news_media/images';
    } else if (mimetype.startsWith('audio/')) {
      folder = 'news_media/audio';
    } else if (mimetype.startsWith('video/')) {
      folder = 'news_media/videos';
    }

    const options = {
      folder,
      resource_type: 'auto', // Let Cloudinary auto-detect resource type
    };

    const callback = (error, result) => {
      if (error) {
        // Log the detailed, original error for debugging on the server
        console.error('Cloudinary Upload Error:', error);

        // **THE FIX**: Reject with a NEW, standard Error object.
        // This ensures a proper error message and stack trace are passed to the .catch() block.
        reject(new Error('Failed to upload file to Cloudinary.'));
      } else {
        resolve(result);
      }
    };

    if (usePath) {
      // Upload using file path
      cloudinary.uploader.upload(file, options, callback);
    } else {
      // Upload using buffer stream
      const uploadStream = cloudinary.uploader.upload_stream(options, callback);
      streamifier.createReadStream(file).pipe(uploadStream);
    }
  });
};

module.exports = { cloudinary, uploadToCloudinary };