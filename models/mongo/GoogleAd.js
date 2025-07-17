const mongoose = require('mongoose');

const googleAdSchema = new mongoose.Schema({
  image: { type: String, required: true },
  imageType: { type: String, enum: ["horizontal", "vertical"], required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('GoogleAd', googleAdSchema);
