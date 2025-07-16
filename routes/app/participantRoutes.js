const router = require('express').Router();
const { uploadStation } = require('../../middlewares/upload');
const participantCtrl = require('../../controllers/app/participantController');

router.post('/submit', uploadStation.single('media'), participantCtrl.submitParticipation);
router.get('/:gameId', participantCtrl.getParticipantsByGame);

module.exports = router;
