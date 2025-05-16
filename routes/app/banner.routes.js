const express = require('express');
const router = express.Router();
const { createBanner, getBanners,updateBanner,updateBannerField,deleteBanner } = require('../../controllers/app/banner.controller');
const upload = require('../../middlewares/upload');

// Expecting multiple images under field name "images"
router.post(
  '/create-banner',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]),
  createBanner
);
router.get('/get-banners', getBanners);
router.put('/update-banner/:id', updateBanner);
router.patch('/update-field/:id', updateBannerField);
router.delete('/delete-banner/:id', deleteBanner);

module.exports = router;
