const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  title: String,
  description: String,
  coverImageUrl: String,
  audioUrl: String,
  season: String,
  genre: String,
  subgenre: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Podcast', podcastSchema);
