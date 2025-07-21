const express = require('express');
const router = express.Router();
const {adminGetBanners, createBanner, getBanners,updateBanner,toggleBannerActive,deleteBanner } = require('../../controllers/app/banner.controller');
const multer = require('multer');


// const storage = multer.diskStorage({
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// });

// 1. Import the factory function from bannerupload.js
const createUploader = require('../../middlewares/bannerupload');

// 2. Call the function to create a middleware specifically for 'app' banners
const appBannerUploader = createUploader('app');
// routes/bannerRoutes.js

router.post(
  '/add-banner',
  appBannerUploader.fields([
    // Change 'images' to 'image' and set maxCount to 1
    { name: 'image', maxCount: 1 }, 
    { name: 'video', maxCount: 1 }
  ]),
  createBanner
);

router.get('/get-banners', getBanners);
router.get('/admin-get-banners', adminGetBanners); 
// routes/bannerRoutes.js

router.put(
  '/update-banner/:id',
  appBannerUploader.fields([
    // CHANGE THIS: from 'images' to 'image' and maxCount to 1
    { name: 'image', maxCount: 1 }, 
    { name: 'video', maxCount: 1 }
  ]),
  updateBanner // You will also need to adjust the 'updateBanner' controller to handle a single image object
);

router.patch('/toggle-active/:id',toggleBannerActive);
router.delete('/delete-banner/:id', deleteBanner);

module.exports = router;
