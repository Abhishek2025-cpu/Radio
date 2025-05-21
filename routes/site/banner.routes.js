const express = require('express');
const router = express.Router();
const multer = require('multer');
const bannerController = require('../../controllers/site/banner.controller');

// Multer setup for handling form-data
const storage = multer.diskStorage({
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST: Create banner (images: array, video: single)
router.post(
  '/add-banner',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]),
  bannerController.createBanner
);

// GET: Get all banners
router.get('get-banners/', bannerController.getBanners);

module.exports = router;