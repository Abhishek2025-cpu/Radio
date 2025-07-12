const mongoose = require('mongoose');

const WebsiteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String }, // remove required: true
  votes: { type: Number, default: 0 },
});


module.exports = mongoose.model('Website', websiteSchema);