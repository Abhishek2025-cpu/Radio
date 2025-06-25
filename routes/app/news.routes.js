
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require("../../utils/cloudinary");
const upload = multer({ storage });

const {
  createNews,
  getAllNews,
  getSingleNews,
  updateNews,
  toggleNewsVisibility,
  deleteNews
} = require('../../controllers/app/news.Controller');

router.get('/get-news', getAllNews);
router.get('/get-news/:id', getSingleNews);

router.post('/add-news', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'audio', maxCount: 1 }
]), createNews);

router.put('/update-news/:id', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'audio', maxCount: 1 }
]), updateNews);

router.patch('/toggle-news/:id', toggleNewsVisibility);

router.delete('/delete-news/:id', deleteNews);


module.exports = router; 