const mongoose = require('mongoose');

const podcastSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Podcast name is required.'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      required: true,
    },
    url: { type: String },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Podcast',
      default: null, // A null parent IS a top-level category/genre
    },
    // The image field holds the URL for this specific item.
    // If it's a category, this is the category image.
    // If it's a sub-show, it can have its own image too.
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