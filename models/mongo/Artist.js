const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  songName: { type: String, required: true },
  profileImage: { type: String, required: true }, // URL to image
  votes: { type: Number, default: 0 },
  votedIPs: [{ type: String }], // store hashed or plain IPs for deduplication
   isActive: {
    type: Boolean,
    default: true // Artists are active by default
  }
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);
