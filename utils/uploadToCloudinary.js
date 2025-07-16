const cloudinary = require('./cloudinary'); 
const streamifier = require('streamifier');

const uploadToCloudinary = (file, mimetype, usePath = false) => {
  return new Promise((resolve, reject) => {
    let folder = 'news_media/misc';
    if (mimetype.startsWith('image/')) {
      folder = 'news_media/images';
    } else if (mimetype.startsWith('audio/')) {
      folder = 'news_media/audio';
    } else if (mimetype.startsWith('video/')) {
      folder = 'news_media/videos';
    }

    const options = { folder, resource_type: 'auto' };

    const callback = (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        reject(new Error('Failed to upload file to Cloudinary.'));
      } else {
        resolve(result);
      }
    };

    if (usePath) {
      cloudinary.uploader.upload(file, options, callback);
    } else {
      const uploadStream = cloudinary.uploader.upload_stream(options, callback);
      streamifier.createReadStream(file).pipe(uploadStream);
    }
  });
};

module.exports = uploadToCloudinary;
