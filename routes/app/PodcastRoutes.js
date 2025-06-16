// routes/podcastRoutes.js
const express = require('express');
const router = express.Router();
const podcastController = require('../../controllers/app/podcastController');

router.post('/add-podcast', podcastController.createPodcast);
router.get('/get-podcast', podcastController.getAllPodcasts);
router.get('/podcast/:id', podcastController.getPodcastById);
router.put('update-podcast/:id', podcastController.updatePodcast);
router.delete('delete-podcast/:id', podcastController.deletePodcast);

module.exports = router;
