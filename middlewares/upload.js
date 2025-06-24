// middlewares/upload.js
const multer = require('multer');

const storage = multer.memoryStorage(); // ✅ in-memory storage

const upload = multer({ storage });

module.exports = upload;
