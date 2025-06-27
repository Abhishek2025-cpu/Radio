const express = require('express');
const router = express.Router();
const radioController = require('../../controllers/app/getAllStationMetadata'); 

// Single route for all 6 stations
router.get('/stations/metadata', radioController.getAllStationMetadata);

module.exports = router;
