const express = require('express');
const router = express.Router();
const { createBanner, getBanners } = require('../../controllers/app/banner.controller');

router.post('/add-banners', createBanner);
router.get('/get-banners', getBanners);

module.exports = router;
