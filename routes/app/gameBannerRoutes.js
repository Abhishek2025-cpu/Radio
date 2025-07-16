const router = require('express').Router();
const { uploadStation } = require('../../middlewares/upload');
const bannerCtrl = require('../../controllers/app/gameBannerController');

router.post('/add', uploadStation.single('image'), bannerCtrl.addBanner);
router.get('/get', bannerCtrl.getBanners);
router.patch('/update/:id', uploadStation.single('image'), bannerCtrl.updateBanner);
router.patch('/toggle/:id', bannerCtrl.toggleBanner);

module.exports = router;
