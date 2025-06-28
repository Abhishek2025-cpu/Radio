const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  streamUrl: { type: String, required: true },
  metadataUrl: { type: String, required: true },
  thumbnail_image: { type: String },  // Cloudinary image URL
  color: { type: String },
  song_cover: { type: String },       // Admin override for cover image
}, { timestamps: true });

module.exports = mongoose.model('Station', stationSchema);
