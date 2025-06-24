const express = require('express');
const upload = require('../../middlewares/upload');
const router = express.Router();

const artistController = require('../../controllers/app/artistController');

// CRUD
router.post('/add-artist', upload.single('profileImage'), artistController.createArtist);
router.put('/update-artist/:id', upload.single('profileImage'), artistController.updateArtist);
router.get('/get-all-artists', artistController.getAllArtists);
router.get('/get-artist/:id', artistController.getArtistById);

router.patch('/active-artist/:id', artistController.partialUpdateArtist);
router.delete('/delete-artist/:id', artistController.deleteArtist);

// Voting
router.post('/vote/:id', artistController.voteArtist);

module.exports = router;
