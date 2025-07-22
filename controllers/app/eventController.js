const Event = require('../../models/mongo/Event');

exports.addEvent = async (req, res) => {
  try {
    const image = req.file?.path;
    const { name, artist, date, time, address, description, price, contact } = req.body;
    if (!name || !artist || !date || !time || !image || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const event = await Event.create({
      name, artist, date, time, address, image, description, price, contact
    });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file?.path;
    const update = { ...req.body, ...(image && { image }) };

    const event = await Event.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.isActive = !event.isActive;
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/events - Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/events/artist/:artistId - Get events by artist ID
exports.getEventsByArtistId = async (req, res) => {
  try {
    const { artistId } = req.params;
    const events = await Event.find({ artist: artistId });
    res.json({ success: true, count: events.length, data: events });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};