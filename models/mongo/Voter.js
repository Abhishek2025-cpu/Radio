const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  // Stores a hash of "name_city" to uniquely identify a voter without storing PII.
  identifierHash: {
    type: String,
    required: true,
    unique: true
  },
  // We'll use this timestamp to know when the vote expires.
  votedAt: {
    type: Date,
    default: Date.now,
    // Automatically delete the document after 24 hours.
    // This handles the "data will be deleted" requirement automatically.
    expires: '24h' 
  }
});

module.exports = mongoose.model('Voter', voterSchema);