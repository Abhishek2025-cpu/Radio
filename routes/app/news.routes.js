const express = require('express');
const router = express.Router();
const multer = require('multer');

// --- FIX 1: Add file size limits to the multer configuration ---


const {
  createNews,
  getAllNews,
    getAllNewsAdmin, 
  getSingleNews,
  updateNews,
  toggleNewsVisibility,
  deleteNews
} = require('../../controllers/app/news.Controller');



// --- Apply the middleware and the error handler to your routes ---

// Configure Multer for in-memory storage. This is correct for your setup.
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit per file
});

// THE STANDARD AND CORRECT WAY TO DEFINE THE ROUTE:
// 1. The route path
// 2. The multer middleware to handle file uploads
// 3. The controller function to process the request
router.post('/add-news', upload.array('media', 12), createNews);

// Do the same for your update route
router.put('/update-news/:id', upload.array('media', 12), updateNews);

// --- The rest of your routes remain the same ---
router.get('/get-news', getAllNews);
router.get('/admin/get-news', getAllNewsAdmin);
router.get('/get-news/:id', getSingleNews);
router.patch('/toggle-news/:id', toggleNewsVisibility);
router.delete('/delete-news/:id', deleteNews);

module.exports = router;