const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema({
  url: { type: String, required: true },        // mp3 URL (can be generated from FTP path)
  season: { type: String, default: 'No Season' },
  genre: { type: String, default: 'Unknown' },
  subgenre: { type: String, default: 'General' },
  timestamp: { type: Date, default: Date.now },
  imageUrl: { type: String },                    // Cloudinary URL for podcast image
});

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;
