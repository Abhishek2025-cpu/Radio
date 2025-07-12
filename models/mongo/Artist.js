const mongoose = require('mongoose');
const Website = require('./Website');

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

artistSchema.post('save', async function (doc, next) {
  try {
    // Check if a Website already exists for this artist name to avoid duplicates
    const existingWebsite = await Website.findOne({ name: doc.name });
    if (!existingWebsite) {
      await Website.create({
        name: doc.name,
        url: doc.profileImage || '', // or any other value you prefer
        votes: doc.votes,
      });
    }
    next();
  } catch (error) {
    console.error('Error copying artist to website:', error);
    next(error);
  }
});

module.exports = mongoose.model('Artist', artistSchema);
