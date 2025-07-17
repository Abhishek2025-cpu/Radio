const router = require('express').Router();
const { uploadStation } = require('../../middlewares/upload');
const adCtrl = require('../../controllers/app/googleAdController');


router.post('/add', uploadStation.single('image'), adCtrl.addGoogleAd);
router.get('/get', adCtrl.getGoogleAds);
router.patch('/update/:id', uploadStation.single('image'), adCtrl.updateGoogleAd);
router.patch('/toggle/:id', adCtrl.toggleGoogleAd);

module.exports = router;
