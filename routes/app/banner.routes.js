const express = require('express');
const router = express.Router();
const {adminGetBanners, createBanner, getBanners,updateBanner,toggleBannerActive,deleteBanner } = require('../../controllers/app/banner.controller');
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
createBanner
);

router.get('/get-banners', getBanners);
router.get('/admin-get-banners', adminGetBanners); 
router.put('/update-banner/:id', updateBanner);
router.patch('/toggle-active/:id',toggleBannerActive);
router.delete('/delete-banner/:id', deleteBanner);

module.exports = router;
