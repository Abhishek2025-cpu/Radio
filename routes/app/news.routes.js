const { createNews, getAllNews } = require('../../controllers/app/news.Controller');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require("../../utils/cloudinary");
const upload = multer({ storage });

router.post('/add-news', upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'audio', maxCount: 1 }
]), createNews);

router.get('/get-news', getAllNews);

module.exports = router; 