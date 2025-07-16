const mongoose = require("mongoose");

const GenreShowOverrideSchema = new mongoose.Schema({
  genreName: String,
  subgenreId: String, // podcast-<subgenre>
  visible: { type: Boolean, default: true },
  customName: String,
  customImage: {
    url: String,
    public_id: String,
  },
});

module.exports = mongoose.model("GenreShowOverride", GenreShowOverrideSchema);
