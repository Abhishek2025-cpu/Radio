// models/podcast.model.js

const mongoose = require('mongoose');
const slugify = require('slugify');

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

// Middleware to automatically create a slug from the name before saving
podcastSchema.pre('validate', function (next) { // Changed to pre-validate to ensure slug is present for index
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// *** NEW: Create a compound index for data integrity ***
// This ensures that the combination of a parent and a slug is unique.
// You can have a slug 'l-integrale' under 'U MORNING' and another 'l-integrale' under 'RAMADAN', but not two 'l-integrale' under 'U MORNING'.
podcastSchema.index({ parent: 1, slug: 1 }, { unique: true });

const Podcast = mongoose.model('Podcast', podcastSchema);

module.exports = Podcast;