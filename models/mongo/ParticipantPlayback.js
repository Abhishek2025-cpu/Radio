const mongoose = require('mongoose');

const playbackSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  participant: { type: mongoose.Schema.Types.ObjectId, ref: 'GameParticipant', required: true },
  date: { type: String, required: true },   // e.g. "2024-07-22"
  time: { type: String, required: true },   // e.g. "11:30"
}, { timestamps: true });

module.exports = mongoose.model('ParticipantPlayback', playbackSchema);
