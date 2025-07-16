const router = require('express').Router();
const { uploadStation } = require('../../middlewares/upload');
const gameCtrl = require('../../controllers/app/gameController');

router.post('/add', uploadStation.single('image'), gameCtrl.addGame);
router.get('/get', gameCtrl.getAllGames);
router.patch('/toggle/:id', gameCtrl.toggleGame);

module.exports = router;
