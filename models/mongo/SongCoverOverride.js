const mongoose = require('mongoose');

const songCoverOverrideSchema = new mongoose.Schema({
  // A unique, generated key like "daft_punk_around_the_world"
  songKey: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  artist: String,
  title: String,
  customCoverUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('SongCoverOverride', songCoverOverrideSchema);