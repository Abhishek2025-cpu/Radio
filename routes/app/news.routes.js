const express = require('express');
const router = express.Router();
const multer = require('multer');

// BEST PRACTICE: Use memoryStorage to avoid 502 errors on production servers.
// The file buffer is then sent to Cloudinary from your controller.
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Correctly import the controller functions using destructuring
const {
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  toggleNewsVisibility,
  deleteNews
} = require('../../controllers/app/news.Controller');

// --- These routes do not handle file uploads and are fine ---
router.get('/get-news', getAllNews);
router.get('/get-news/:id', getSingleNews);

// --- This route had a reference error. It is now fixed. ---
router.post(
  '/add-news',
  upload.array('media', 12),
  createNews // FIX: Changed from 'newsController.createNews' to the correctly imported 'createNews'
);

// --- This was the main source of the "Unexpected field" error. It is now fixed. ---
router.put(
  '/update-news/:id',
  upload.array('media', 12), // FIX: Changed from upload.fields(...) to use the same generic 'media' array.
  updateNews
);

// --- These routes are fine ---
router.patch('/toggle-news/:id', toggleNewsVisibility);
router.delete('/delete-news/:id', deleteNews);


module.exports = router;