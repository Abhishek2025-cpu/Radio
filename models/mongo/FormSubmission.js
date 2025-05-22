const mongoose = require('mongoose');

const FormSubmissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNo: { type: String, required: true },
  city: { type: String, required: true },
  audioUrl: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('FormSubmission', FormSubmissionSchema);