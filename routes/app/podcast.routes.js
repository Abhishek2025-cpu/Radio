// // routes/podcast.routes.js

// const express = require('express');
// const router = express.Router();
// // const { podcastUploader } = require('../../middlewares/cloudinaryUploader'); 


// const upload = require('../../middlewares/upload');

// const {
//   createPodcast,
//   getAllPodcasts,
//   getPodcastByPath,
//   addGenre,
//   toggleGenreStatus,
//   deleteGenre,
//   getAllGenresForAdmin,
//   updateGenre,
// //   updatePodcast,
// getAllPodcastsAdmin,
//   deletePodcast,
//    getUniqueGenres,
//    getSubgenresByGenreName,
//   togglePodcastStatus
// } = require('../../controllers/app/podcast.controller'); // Assuming your controller path is correct

// // ===================================
// //  PUBLIC ROUTES (for fetching data)
// // ===================================

// router.post('/add-podcast', upload.single('image'),addGenre);
// router.put('/update-podcast/:id', upload.single('image'),updateGenre);
// router.patch('/toggle-status/:id', toggleGenreStatus);
// router.delete('/delete-podcast/:id', deleteGenre);
// router.get('/admin/all',getAllGenresForAdmin);




// // Get the entire podcast tree for navigation
// // Mapped to: GET /api/podcasts/all
// router.get('/all', getAllPodcasts);
// router.get('/admin',getAllPodcastsAdmin);
// router.get('/unique-genres', getUniqueGenres);
// router.get("/subgenre/:genreName",getSubgenresByGenreName);


// // Get a specific podcast and its children by its URL path
// // Mapped to: GET /api/podcasts/by-path/*
// router.get('/by-path', getPodcastByPath);


// // ===================================
// //  ADMIN ROUTES (for managing content)
// // ===================================

// // ** NEW **: Route to create a new podcast
// // Mapped to: POST /api/podcasts/create
// router.post('/create', createPodcast);

// // Route to update a podcast by its ID
// // Mapped to: PUT /api/podcasts/update/:id
// // router.put(
// //   '/update/:id',
// //   podcastUploader.single('podcastImage'), // This middleware does all the work!
// //   updatePodcast
// // );

// // Route to delete a podcast by its ID
// // Mapped to: DELETE /api/podcasts/delete/:id
// router.delete('/delete/:id', deletePodcast);

// // ** REVISED for consistency **: Route to toggle a podcast's active status
// // Mapped to: PATCH /api/podcasts/toggle-status/:id
// router.patch('/toggle-status/:id', togglePodcastStatus);


// module.exports = router;


const express = require('express');
const router = express.Router();
const { uploadStation } = require('../../middlewares/upload');

// Import ALL necessary handlers from the single controller file
const {
  // Genre Handlers
  addGenre,
  updateGenre,
  toggleGenreStatus,
  deleteGenre,

  getPublicGenres, // Use this new one!
getAdminGenres,
  // Podcast Handlers
  createPodcast,
  getAllPodcasts,
  getPodcastByPath,
 getUniqueGenres,
  deletePodcast,
  getSubgenresByGenreName,
  togglePodcastStatus
} = require('../../controllers/app/podcast.controller');

// ===================================
//  GENRE ROUTES
// ===================================

// POST /api/podcasts/genres/add
router.post('/genres/add', uploadStation.single('image'), addGenre);

// PUT /api/podcasts/genres/update/:id
router.put('/genres/update/:id', uploadStation.single('image'), updateGenre);

// PATCH /api/podcasts/genres/toggle-status/:id
router.patch('/genres/toggle-status/:id', toggleGenreStatus);

// DELETE /api/podcasts/genres/delete/:id
router.delete('/genres/delete/:id', deleteGenre);

// GET /api/podcasts/genres/admin/all


// GET /api/podcasts/genres/public   <-- THIS FIXES THE ERROR
router.get('/genres/public', getPublicGenres);
router.get('/unique-genres',getUniqueGenres);
router.get('/admin-all',getAdminGenres);


// ===================================
//  PODCAST ROUTES
// ===================================

// GET /api/podcasts/all
router.get('/all', getAllPodcasts);

// GET /api/podcasts/admin/all


// GET /api/podcasts/subgenre/:genreName
router.get("/subgenre/:genreName", getSubgenresByGenreName);

// GET /api/podcasts/by-path
router.get('/by-path', getPodcastByPath);

// POST /api/podcasts/create
router.post('/create', upload.single('podcastImage'), createPodcast);

// DELETE /api/podcasts/delete/:id
router.delete('/delete/:id', deletePodcast);

// PATCH /api/podcasts/toggle-status/:id
router.patch('/toggle-status/:id', togglePodcastStatus);


module.exports = router;