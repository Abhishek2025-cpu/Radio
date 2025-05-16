const express = require('express');
const router = express.Router();
const { createBanner, getBanners } = require('../../controllers/bannerController');
const { uploadBannerMedia } = require('../../middleware/upload');

// Expecting multiple images under field name "images"
router.post('/create-banner', uploadBannerMedia.array('images'), createBanner);
router.get('/get-banners', getBanners);

module.exports = router;
