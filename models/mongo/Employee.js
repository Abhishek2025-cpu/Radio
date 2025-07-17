const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@uradio\.ma$/, 'Email must end with @uradio.ma'],
  },
  password: { type: String, required: true },
  role: { type: String, enum: ['Super Admin', 'Admin'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
