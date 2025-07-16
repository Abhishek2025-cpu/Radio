const Performer = require('../../models/mongo/Performer');
const Event = require('../../models/mongo/Event');

// Add performer
exports.addPerformer = async (req, res) => {
  try {
    const image = req.file?.path;
    const { name } = req.body;
    if (!name || !image) return res.status(400).json({ message: "Name and image required" });

    const performer = await Performer.create({ name, image });
    res.status(201).json({ success: true, performer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all performers with their events
exports.getPerformersWithEvents = async (req, res) => {
  try {
    const performers = await Performer.find().lean();
    const result = await Promise.all(performers.map(async performer => {
      const events = await Event.find({ artist: performer._id });
      return { ...performer, events };
    }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ✅ Get all performer names with _id and image
exports.getPerformerNames = async (req, res) => {
  try {
    const performers = await Performer.find({}, { name: 1, image: 1 }).lean();
    res.json({ success: true, data: performers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePerformer = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file?.path;
    const { name } = req.body;
    const update = { ...(name && { name }), ...(image && { image }) };

    const performer = await Performer.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, performer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePerformer = async (req, res) => {
  try {
    const { id } = req.params;
    await Performer.findByIdAndDelete(id);
    await Event.deleteMany({ artist: id }); // remove associated events
    res.json({ success: true, message: "Performer & events deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.togglePerformer = async (req, res) => {
  try {
    const { id } = req.params;
    const performer = await require('../../models/mongo/Performer').findById(id);
    if (!performer) return res.status(404).json({ message: "Performer not found" });

    performer.isActive = !performer.isActive;
    await performer.save();

    res.json({ success: true, performer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
