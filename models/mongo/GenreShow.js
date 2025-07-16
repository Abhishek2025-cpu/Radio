const mongoose = require("mongoose");

const GenreShowSchema = new mongoose.Schema({
  genreName: { type: String, required: true },  // Link to genre name
  name: { type: String, required: true },
  image: {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  visible: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("GenreShow", GenreShowSchema);
