const express = require('express');
const router = express.Router();
const controller = require('../../controllers/app/podcastController');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/podcasts-all', controller.getAllPodcasts);
router.get('/podcasts-latest', controller.getLatestPodcasts);
router.post('/add-podcasts', controller.addPodcast);
router.put('/update-podcasts/:id', controller.updatePodcast);
router.delete('/delete-podcasts/:id', controller.deletePodcast);

// Genre cover upload
router.post('/podcat/genres/:genreName/cover', upload.single('coverImage'), controller.uploadGenreCover);

module.exports = router;
