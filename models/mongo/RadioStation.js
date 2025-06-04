const mongoose = require("mongoose");

const radioStationSchema = new mongoose.Schema({
  VILLE: { type: String, required: true },
  FREQUENCE: { type: Number, required: true },
  GPS: {
    LATITUDE: { type: Number, required: true },
    LONGITUDE: { type: Number, required: true }
  },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model("RadioStation", radioStationSchema);
