const router = require('express').Router();
const { uploadStation } = require('../../middlewares/upload');
const performerCtrl = require('../../controllers/app/performerController');

router.post('/add', uploadStation.single('image'), performerCtrl.addPerformer);
router.get('/artist/events', performerCtrl.getPerformersWithEvents);
router.get('/by-names', performerCtrl.getPerformerNames); // ✅ new route
router.patch('/update/:id', uploadStation.single('image'), performerCtrl.updatePerformer);
router.delete('delete/:id', performerCtrl.deletePerformer);

module.exports = router;
