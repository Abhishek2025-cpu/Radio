const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/podcastController');

router.get('/podcast-all', controller.getAllPodcasts);
router.get('/podcast-latest', controller.getLatestPodcasts);
router.post('/add-podcast', controller.addPodcast);
router.put('update-podcast/:id', controller.updatePodcast);
router.delete('delete-podcast/:id', controller.deletePodcast);

module.exports = router;
