const express = require('express');
const upload = require('../../middlewares/upload');
const router = express.Router();

const artistController = require('../../controllers/app/artistController');

// CRUD
router.post(
  '/add-artist',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'media', maxCount: 1 },
  ]),
  artistController.createArtist
);

router.patch(
  '/update-artist/:id',
upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'songName', maxCount: 1 } // ✅ must be exactly 'songName'
]),

  artistController.updateArtist
);


router.get('/get-all-artists', artistController.getAllArtists);
router.get('/get-artist/:id', artistController.getArtistById);


router.delete('/delete-artist/:id', artistController.deleteArtist);

// Voting
router.post('/vote/:id', artistController.voteArtist);
// routes/app/artistRoutes.js
router.patch('/active-artist/:id', artistController.partialUpdateArtist);


module.exports = router;
