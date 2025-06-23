const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  coverImageUrl: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('Genre', GenreSchema);
