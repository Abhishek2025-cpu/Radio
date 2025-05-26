const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dvumlrxml',
  api_key: '437932967899129',
  api_secret: 'Pg4zI1EW8iCdotG29P4jcHFAW4s',
});


const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: file.fieldname === 'images' ? 'news_images' : 'news_audio',
    resource_type: file.mimetype.startsWith('audio') ? 'video' : 'image'
  }),
});

module.exports = { cloudinary, storage };