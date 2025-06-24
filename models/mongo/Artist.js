// models/Artist.js
const artistSchema = new mongoose.Schema({
  name: String,
  songName: String,
  profileImage: String,
  votes: {
    type: Number,
    default: 0
  },
  // Each entry holds { ip: string, votedAt: Date }
  votedIPs: {
    type: [
      {
        ip: String,
        votedAt: Date
      }
    ],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
});
