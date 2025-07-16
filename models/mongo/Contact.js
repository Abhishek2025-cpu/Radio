const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  ville: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
