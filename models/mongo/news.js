
const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({
  images: [String],
  author: String,
  heading: String,
  paragraphChunks: [String],
  subParagraphChunks: [String],
  audioUrl: String
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);