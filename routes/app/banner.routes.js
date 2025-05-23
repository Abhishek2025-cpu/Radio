const express = require('express');
const router = express.Router();
const { createBanner, getBanners,updateBanner,updateBannerField,deleteBanner } = require('../../controllers/app/banner.controller');
const multer = require('multer');
const storage = multer.diskStorage({
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post(
  '/add-banner',
  upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'video', maxCount: 1 }
  ]),
  bannerController.createBanner
);

router.get('/get-banners', getBanners);
router.put('/update-banner/:id', updateBanner);
router.patch('/update-field/:id', updateBannerField);
router.delete('/delete-banner/:id', deleteBanner);

module.exports = router;
