// models/station.model.js

const mongoose = require('mongoose');

// Define a schema for the "now playing" sub-document
// This ensures data consistency for the items in the 'nowPlaying' array
const NowPlayingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String },
    coverUrl: { type: String }, // <-- THIS IS ESSENTIAL
    playedAt: { type: Number }, // <-- THIS IS ESSENTIAL
    duration: { type: Number }
});// Using _id: false prevents Mongoose from creating redundant IDs for these sub-documents

const stationSchema = new mongoose.Schema({
    // e.g., "U80", "U90". We use this for easy lookups.
    stationId: {
        type: String,
        required: [true, 'A stationId is required.'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'A station name is required.'],
        trim: true,
    },
    // The URL to get live metadata from
    infomaniakUrl: {
        type: String,
        required: [true, 'An infomaniakUrl is required to fetch metadata.'],
    },
    // The actual audio stream URL
    customStreamUrl: {
        type: String,
        required: [true, 'A customStreamUrl is required.'],
    },
    // URL for the station's image, will be populated by Cloudinary
    thumbnailUrl: {
        type: String,
        default: '',
    },
    isVisible: {
        type: Boolean,
        default: true,
    },
    color: {
        type: String,
        default: '#FFFFFF',
    },
    // This field will be populated automatically by fetching from infomaniakUrl
    nowPlaying: [NowPlayingSchema]
},
{
    // Automatically add `createdAt` and `updatedAt` fields
    timestamps: true,
});

module.exports = mongoose.model('Station', stationSchema);