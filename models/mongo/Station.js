const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  // e.g., "U80", "U90". We use this for easy lookups.
  stationId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  name: {
    type: String,
    required: true,
  },
  // The URL to get live data
  infomaniakUrl: {
    type: String,
    required: true,
  },
  // --- YOUR CUSTOM OVERRIDE FIELDS ---
  customStreamUrl: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: '',
  },
    isVisible: {
    type: Boolean,
    default: true, // Stations are visible by default when created
  },
  color: {
    type: String,
    default: '#FFFFFF',
  }
});

module.exports = mongoose.model('Station', stationSchema);