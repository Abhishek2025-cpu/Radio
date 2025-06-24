const express = require('express');
const router = express.Router();
const artistController = require('../../controllers/app/artistController');

// CRUD
router.post('/add-artist', artistController.createArtist);
router.get('/get-all-artists', artistController.getAllArtists);
router.get('/get-artist/:id', artistController.getArtistById);
router.put('update-artist/:id', artistController.updateArtist);
router.patch('active-artist/:id', artistController.partialUpdateArtist);
router.delete('delete-artist/:id', artistController.deleteArtist);

// Voting
router.post('/vote/:id', artistController.voteArtist);

module.exports = router;
