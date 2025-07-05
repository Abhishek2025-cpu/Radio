const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // Usually the filename, cleaned up
    },
    // The full public URL to the mp3 file
    url: {
        type: String,
        required: true,
        unique: true
    },
    // Link to the parent show
    show: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show',
        required: true
    },
    publishedAt: {
        type: Date,
        required: true // The timestamp from the FTP file
    },
    duration: {
        type: Number // in seconds, if you can get this metadata
    }
}, { timestamps: true });

// Index for faster querying
episodeSchema.index({ show: 1, publishedAt: -1 });

module.exports = mongoose.model('Episode', episodeSchema);