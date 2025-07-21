const express = require('express');

const bannerController = require('../../controllers/site/banner.controller');
const router = express.Router();

// 1. Import the factory function from bannerupload.js
// 1. Import the same factory function from bannerupload.js
const createUploader = require('../../middlewares/bannerupload');

// 2. Call the function to create a middleware specifically for 'site' banners
const siteBannerUploader = createUploader('site');

router.post(
  '/add-banner',
  siteBannerUploader.fields([
    { name: 'image', maxCount: 1 },   // ✅ one image
    { name: 'video', maxCount: 1 }    // ✅ one video
  ]),
  bannerController.createBanner
);



// GET: Get all banners
router.get('/get-banners', bannerController.getBanners);
// site.routes.js
router.get('/admin-get-banners', bannerController.adminGetBanners);
router.put(
  '/update-banner/:id',
  siteBannerUploader.fields([
    { name: 'image', maxCount: 1 },   // ✅ singular 'image'
    { name: 'video', maxCount: 1 }
  ]),
  bannerController.updateBanner
);


router.patch('/toggle-active/:id', bannerController.toggleBannerActive);
router.delete('/delete-banner/:id', bannerController.deleteBanner);


module.exports = router;