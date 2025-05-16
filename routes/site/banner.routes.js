const express = require('express');
const router = express.Router();
const controller = require('../../controllers/site/banner.controller');

router.post('/add-banner', controller.createBanner);
router.get('/get-banners', controller.getBanners);

module.exports = router; // ✅ This line must exist!
