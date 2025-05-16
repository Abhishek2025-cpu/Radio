const mongoose = require('mongoose');

const siteBannerSchema = new mongoose.Schema({
  title: String,
  image: String,
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteBanner', siteBannerSchema);
