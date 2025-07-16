const router = require('express').Router();
const playbackCtrl = require('../../controllers/app/playbackController');

router.post('/add', playbackCtrl.addPlayback);
router.get('/:gameId', playbackCtrl.getPlaybackByGame);
router.patch('/update/:id', playbackCtrl.updatePlayback);
router.delete('/delete/:id', playbackCtrl.deletePlayback);

module.exports = router;
