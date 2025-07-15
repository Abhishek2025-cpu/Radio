// routes/podcast.routes.js

const express = require('express');
const router = express.Router();
// const { podcastUploader } = require('../../middlewares/cloudinaryUploader'); 

const {
  createPodcast,
  getAllPodcasts,
  getPodcastByPath,
//   updatePodcast,
  deletePodcast,
   getUniqueGenres,
   getSubgenresByGenreName,
  togglePodcastStatus
} = require('../../controllers/app/podcast.controller'); // Assuming your controller path is correct

// ===================================
//  PUBLIC ROUTES (for fetching data)
// ===================================

// Get the entire podcast tree for navigation
// Mapped to: GET /api/podcasts/all
router.get('/all', getAllPodcasts);
router.get('/unique-genres', getUniqueGenres);
router.get("/subgenre/:genreName",getSubgenresByGenreName);


// Get a specific podcast and its children by its URL path
// Mapped to: GET /api/podcasts/by-path/*
router.get('/by-path', getPodcastByPath);


// ===================================
//  ADMIN ROUTES (for managing content)
// ===================================

// ** NEW **: Route to create a new podcast
// Mapped to: POST /api/podcasts/create
router.post('/create', createPodcast);

// Route to update a podcast by its ID
// Mapped to: PUT /api/podcasts/update/:id
// router.put(
//   '/update/:id',
//   podcastUploader.single('podcastImage'), // This middleware does all the work!
//   updatePodcast
// );

// Route to delete a podcast by its ID
// Mapped to: DELETE /api/podcasts/delete/:id
router.delete('/delete/:id', deletePodcast);

// ** REVISED for consistency **: Route to toggle a podcast's active status
// Mapped to: PATCH /api/podcasts/toggle-status/:id
router.patch('/toggle-status/:id', togglePodcastStatus);


module.exports = router;