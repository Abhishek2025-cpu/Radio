const mongoose = require('mongoose');

const gameBannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String }, // <-- New field added here
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('GameBanner', gameBannerSchema);
