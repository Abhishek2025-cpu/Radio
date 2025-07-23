const router = require('express').Router();
const { uploadMedia,uploadAudio } = require('../../middlewares/upload');
const participantCtrl = require('../../controllers/app/participantController');

router.post('/submit', uploadMedia.single('media'), participantCtrl.submitParticipation);
router.get('/:gameId', participantCtrl.getParticipantsByGame);
router.delete('/delete/:id', participantCtrl.deleteParticipant);
router.post('/participation-msg', uploadAudio.single('audio'), participantCtrl.submitParticipationMessage);
router.get('/msg/game/:gameId', participantCtrl.getParticipationMessages);
router.delete('/delete-participation-msg/:id', participantCtrl.deleteParticipationMessage);

module.exports = router;

