const router = require('express').Router();
const { uploadMedia } = require('../../middlewares/upload');
const participantCtrl = require('../../controllers/app/participantController');

router.post('/submit', uploadMedia.single('media'), participantCtrl.submitParticipation);
router.get('/:gameId', participantCtrl.getParticipantsByGame);
router.delete('/delete/:id', participantCtrl.deleteParticipant);

module.exports = router;

