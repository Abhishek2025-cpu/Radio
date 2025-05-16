const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/banner.controller');//same for site

router.post('/add-banners', controller.createBanner);
router.get('/get-banners', controller.getBanners);

module.exports = router; // ✅ Must be exported properly!
