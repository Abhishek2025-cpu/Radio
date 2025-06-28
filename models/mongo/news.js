const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  // --- Text Content Fields ---
  author: { 
    type: String, 
    required: true 
  },
  heading: { 
    type: String, 
    required: true 
  },
  paragraphChunks: [String],
  subParagraphChunks: [String],

  // --- Media URL Fields (Modified) ---
  imageUrls: [String], // <-- RENAMED for clarity and consistency

  audioUrls: [String], // <-- CHANGED from a single String to an array of Strings

  videoUrls: [String], // <-- ADDED new field for video URLs

  // --- Metadata Field ---
  visible: { 
    type: Boolean, 
    default: true 
  }

}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

module.exports = mongoose.model('News', newsSchema);