const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // e.g., "ACH TARY"
    },
    description: {
        type: String
    },
    // This links the show to its parent genre
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true
    },
    // The path on the FTP server where this show's files are located
    ftpPath: {
        type: String,
        required: true,
        unique: true // e.g., "/podcasts/U MORNING/ACH TARY/"
    }
}, { timestamps: true });

// Ensure a show name is unique within a specific genre
showSchema.index({ name: 1, genre: 1 }, { unique: true });

module.exports = mongoose.model('Show', showSchema);