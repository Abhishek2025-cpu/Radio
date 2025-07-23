const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Podcast name is required.'],
      trim: true,
    },
    subgenre: { // <-- Renamed from 'slug'
      type: String,
      lowercase: true,
      required: true,
    },
    url: { type: String },
    genre: {
      type: String,
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast',
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    episodes: [
      {
        title: String,
        url: String,
        publishedDate: Date,
        duration: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);


// ... rest of your model file (indexes, pre-save hooks) ...

const Podcast = mongoose.model('Podcast', podcastSchema);
module.exports = Podcast;