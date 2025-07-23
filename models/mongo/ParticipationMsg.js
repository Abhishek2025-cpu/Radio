const mongoose = require('mongoose');

const participationMsgSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  city: { type: String, required: true },
  audio: { type: String, required: true }, // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('ParticipationMsg', participationMsgSchema);
