const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: String,
  songName: String,
  profileImage: String,
  votes: {
    type: Number,
    default: 0,
  },
  votedIPs: {
    type: [
      {
        ipHash: String,
        votedAt: Date,
      }
    ],
    default: [],

  },

    mediaUrl: { type: String }, 
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Artist', artistSchema);
