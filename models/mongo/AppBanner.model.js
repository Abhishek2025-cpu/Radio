const mongoose = require('mongoose');

const appBannerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['live-info', 'carousel', 'contact-link'],
    required: true
  },
  title: String,
  content: String,
  images: [String],
  video: String,
  link: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AppBanner', appBannerSchema);
