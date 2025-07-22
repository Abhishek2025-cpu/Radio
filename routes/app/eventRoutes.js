const router = require('express').Router();
const { uploadStation } = require('../../middlewares/upload');
const eventCtrl = require('../../controllers/app/eventController');

router.post('/add', uploadStation.single('image'), eventCtrl.addEvent);
router.patch('/update/:id', uploadStation.single('image'), eventCtrl.updateEvent);
router.delete('/delete/:id', eventCtrl.deleteEvent);
router.patch('/status/:id', eventCtrl.toggleEvent);
router.get('/all', eventCtrl.getAllEvents);
router.get('/artist/:artistId', eventCtrl.getEventsByArtistId);

module.exports = router;
