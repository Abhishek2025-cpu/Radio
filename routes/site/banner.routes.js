const express = require('express');
const router = express.Router();

const bannerController = require('../../controllers/site/banner.controller');

const multer = require('multer');
const { storage } = require('../../utils/cloudinary'); 
const upload = multer({ storage });

router.post(
  '/add-banner',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]),
  bannerController.createBanner
);

// GET: Get all banners
router.get('/get-banners', bannerController.getBanners);
// site.routes.js
router.get('/admin-get-banners', bannerController.adminGetBanners);
router.put('/update-banner/:id', bannerController.updateBanner);
router.patch('/toggle-active/:id', bannerController.toggleBannerActive);
router.delete('/delete-banner/:id', bannerController.deleteBanner);


module.exports = router;