const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  votes: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Website', websiteSchema);