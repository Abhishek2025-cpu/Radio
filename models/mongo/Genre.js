const mongoose = require('mongoose');

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // e.g., "U MORNING"
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String, // URL to the genre's image
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Genre', genreSchema);


