const RadioStation = require("../../models/mongo/RadioStation");

// Create
exports.addRadioStation = async (req, res) => {
  try {
    const station = new RadioStation(req.body);
    await station.save();
    res.status(201).json(station);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Read all
exports.getAllStations = async (req, res) => {
  try {
    const stations = await RadioStation.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateStation = async (req, res) => {
  try {
    const station = await RadioStation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    res.status(201).json(station); // 201 for successful update (as per your request)
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Delete
exports.deleteStation = async (req, res) => {
  try {
    const result = await RadioStation.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Station not found" });
    res.json({ message: "Station deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle Active/Inactive
exports.toggleActive = async (req, res) => {
  try {
    const station = await RadioStation.findById(req.params.id);
    if (!station) return res.status(404).json({ error: "Station not found" });
    station.isActive = !station.isActive;
    await station.save();
    res.json({ message: `Station is now ${station.isActive ? "active" : "inactive"}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
