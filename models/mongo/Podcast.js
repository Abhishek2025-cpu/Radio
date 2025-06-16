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
  image: String,       // <-- NEW: for filename or identifier
  imageUrl: String     // <-- Existing: for Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('Podcast', podcastSchema);
