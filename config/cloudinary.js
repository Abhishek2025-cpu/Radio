// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//   cloud_name: 'dvumlrxml',
//   api_key: '437932967899129',
//   api_secret: 'Pg4zI1EW8iCdotG29P4jcHFAW4s',
// });


// cloudinary.uploader.upload('./test.jpg', { folder: 'podcasts/covers' })
//   .then(res => console.log('Upload success:', res.secure_url))
//   .catch(err => console.error('Upload fail:', err));

// module.exports = cloudinary;
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvumlrxml',
  api_key: process.env.CLOUDINARY_API_KEY || '437932967899129',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Pg4zI1EW8iCdotG29P4jcHFAW4s',
});

module.exports = cloudinary;
