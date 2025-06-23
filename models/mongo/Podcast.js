const mongoose = require('mongoose');

const PodcastSchema = new mongoose.Schema({
  title: String,
  description: String,
  audioUrl: { type: String, required: true }, // unified
  season: String,
  genre: String,
  subgenre: String,
}, { timestamps: true });

module.exports = mongoose.model('Podcast', PodcastSchema);
