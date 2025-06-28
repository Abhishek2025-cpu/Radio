const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dvumlrxml',
  api_key: '437932967899129',
  api_secret: 'Pg4zI1EW8iCdotG29P4jcHFAW4s',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'misc';
    let resource_type = file.mimetype.startsWith('audio') ? 'video' : 'image';

    // Folder logic based on field name
    switch (file.fieldname) {
      case 'images':
        folder = 'news_images';
        break;
      case 'audio':
        folder = 'news_audio';
        break;
      case 'thumbnail_image':
        folder = 'radio_thumbnails';
        break;
      case 'song_cover':
        folder = 'radio_song_covers';
        break;
      default:
        folder = 'misc';
    }

    return {
      folder,
      resource_type
    };
  }
});

module.exports = { cloudinary, storage };
