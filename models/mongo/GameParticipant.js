const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  dateNaissance: { type: String, required: true },
  ville: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  media: { type: String }, // Video or Photo path
}, { timestamps: true });

module.exports = mongoose.model('GameParticipant', participantSchema);
