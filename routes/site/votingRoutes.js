const express = require('express');
const router = express.Router();
const { voteForWebsite } = require('../../controllers/site/votingController'); // Adjust path if needed

// @route   POST /api/websites/:id/vote
// @desc    Register a vote for a website
// @access  Public
router.post('/artist/:id/vote', voteForWebsite);

// You can add other routes here later, for example:
// router.get('/', getAllWebsites); 
// router.post('/', createWebsite);

module.exports = router;