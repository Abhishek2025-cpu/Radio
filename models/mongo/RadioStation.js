const mongoose = require("mongoose");

const radioStationSchema = new mongoose.Schema({
  VILLE: String,
  FREQUENCE: Number,
  GPS: {
    LATITUDE: Number,
    LONGITUDE: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
});

// Use lowercase collection name "radioStation"
module.exports = mongoose.model("RadioStation", radioStationSchema, "radioStation");
