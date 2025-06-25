const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  images: [String],
  author: { type: String, required: true },
  heading: { type: String, required: true },
  paragraphChunks: [String],
  subParagraphChunks: [String],
  audioUrl: String,
  visible: { type: Boolean, default: true } // <-- Add this
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);
