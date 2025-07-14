const express = require('express');
const router = express.Router();
const multer = require('multer');

// --- FIX 1: Add file size limits to the multer configuration ---
const memoryStorage = multer.memoryStorage();
const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit for each file
    // You can also set other limits, e.g., 'files: 12'
  },
});

const {
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  toggleNewsVisibility,
  getAllNewsAdmin,
  deleteNews
} = require('../../controllers/app/news.Controller');

// Define a reusable upload middleware with error handling
const uploadMedia = upload.array('media', 12);

// --- FIX 2: Create a dedicated Multer error handler function ---
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    console.error("❌ Multer Error:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 50MB.' });
    }
    // Handle other Multer errors (e.g., LIMIT_UNEXPECTED_FILE)
    return res.status(400).json({ error: `File upload error: ${err.message}` });
  } else if (err) {
    // Handle other non-Multer errors
    console.error("❌ Non-Multer Error during upload:", err);
    return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
  }
  // If no error, proceed to the next middleware (the controller)
  next();
}


// --- Apply the middleware and the error handler to your routes ---

router.post(
  '/add-news',
  (req, res, next) => {
    // Wrap the upload middleware in a function to pass errors to our handler
    uploadMedia(req, res, (err) => handleMulterError(err, req, res, next));
  },
  createNews
);

router.put(
  '/update-news/:id',
  (req, res, next) => {
    uploadMedia(req, res, (err) => handleMulterError(err, req, res, next));
  },
  updateNews
);


// --- The rest of your routes remain the same ---
router.get('/get-news', getAllNews);
router.get('/get-news/admin',getAllNewsAdmin);
router.get('/get-news/:id', getSingleNews);
router.patch('/toggle-news/:id', toggleNewsVisibility);
router.delete('/delete-news/:id', deleteNews);

module.exports = router;