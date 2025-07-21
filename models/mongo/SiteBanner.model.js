const mongoose = require('mongoose');

const siteBannerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['hero-banner', 'popup-banner', 'info-strip'],
    required: true
  },
  title: String,
  content: String,
  image: String,  // Changed from images: [String] to image: String
  video: String,
  link: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteBanner', siteBannerSchema);
