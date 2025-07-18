


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
  // createPodcast,
  getAllPodcasts,

 getUniqueGenres,
  deletePodcast,
  getSubgenresByGenreName,
  togglePodcastStatus,
  //show Handlers
  addShowToGenre,
  getAllGenreShows,
  toggleGenreShow,
  deleteGenreShow,
  updateGenreShow,
  getSubgenresByGenreNameAdmin
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
router.get("/admin/:genreName", getSubgenresByGenreNameAdmin);

// GET /api/podcasts/by-path


// POST /api/podcasts/create
// router.post('/create', upload.single('podcastImage'), createPodcast);

// DELETE /api/podcasts/delete/:id
router.delete('/delete/:id', deletePodcast);

// PATCH /api/podcasts/toggle-status/:id
router.patch('/toggle-status/:id', togglePodcastStatus);



//////////////////////////////////shows-routes///////////////////////////////////////////////////////////
router.post("/:genreName/add", uploadStation.single("image"), addShowToGenre);
router.get("/",getAllGenreShows);
router.put("/:genreName/toggle/:identifier",toggleGenreShow);
router.delete("/delete/:identifier", deleteGenreShow);
router.put("/:genreName/update/:showId", uploadStation.single("image"),updateGenreShow);


module.exports = router;