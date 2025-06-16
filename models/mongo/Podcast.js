// models/Podcast.js
const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  url: { type: String, required: true, unique: true },
  season: String,
  genre: String,
  subgenre: String,
  timestamp: Date,
  title: String,
  description: String,
  tags: [String],
  duration: String,
  imageUrl: String
}, { timestamps: true });

module.exports = mongoose.model('Podcast', podcastSchema);
