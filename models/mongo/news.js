// AFTER: New, Flexible Schema
const newsSchema = new mongoose.Schema({
  author: { type: String, required: true },
  heading: { type: String, required: true },
  paragraphChunks: [String],
  subParagraphChunks: [String],
  imageUrls: [String], // Renamed for consistency
  audioUrls: [String], // Now an array to allow multiple audio files
  videoUrls: [String], // New field for video files
}, { timestamps: true }); // It's good practice to add timestamps
