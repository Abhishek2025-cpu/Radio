const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Genre name is required'],
      unique: true, // Ensures genre names are unique
      trim: true,
    },
    image: {
      url: {
        type: String,
        default: null, // URL from Cloudinary
      },
      public_id: {
        type: String, // ID from Cloudinary to manage (delete/update) the image
        default: null,
      },
    },
    status: {
      type: String,
      enum: ['enabled', 'disabled'], // Only two possible values
      default: 'enabled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Genre', GenreSchema);