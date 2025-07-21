const GameBanner = require('../../models/mongo/GameBanner');

// Add banner
exports.addBanner = async (req, res) => {
  try {
    const image = req.file?.path;
    const { title } = req.body;

    if (!title || !image) {
      return res.status(400).json({ success: false, message: "Title and image are required" });
    }

    const banner = await GameBanner.create({ title, image });
    res.status(201).json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await GameBanner.find().sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update banner
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file?.path;
    const update = { ...req.body, ...(image && { image }) };

    const banner = await GameBanner.findByIdAndUpdate(id, update, { new: true });
    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Toggle isActive
exports.toggleBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await GameBanner.findById(id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    banner.isActive = !banner.isActive;
    await banner.save();

    res.json({ success: true, banner });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Delete banner by ID
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await GameBanner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    await GameBanner.findByIdAndDelete(id);

    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
