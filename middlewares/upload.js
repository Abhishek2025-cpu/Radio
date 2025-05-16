const multer = require('multer');

// Use memory storage to access file buffer directly
const storage = multer.memoryStorage();

const uploadBannerMedia = multer({ storage });

module.exports = { uploadBannerMedia };
s