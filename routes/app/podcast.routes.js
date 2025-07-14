// routes/podcast.routes.js

const express = require('express');
const router = express.Router();

const {
  createPodcast,
  getAllPodcasts,
  getPodcastByPath, // <-- Import the new function
  updatePodcast,
  deletePodcast,
  togglePodcastStatus
} = require('../../controllers/app/podcast.controller');

// routes/podcast.routes.js

// Base route: /api/podcasts
// Route to get the entire podcast tree
// Mapped to: GET /api/podcasts/
router.get('/all', getAllPodcasts);

// Route to get a specific podcast and its children by its URL path
// Mapped to: GET /api/podcasts/by-path/*
router.get('/by-path/*', getPodcastByPath);



router.put('/update/:id', updatePodcast);

// Route to delete a podcast by its ID
// Mapped to: DELETE /api/podcasts/:id
router.delete('/delete/:id', deletePodcast);

// Route to toggle a podcast's active status
// Mapped to: PATCH /api/podcasts/:id/status
router.patch('/:id/status', togglePodcastStatus);

module.exports = router;