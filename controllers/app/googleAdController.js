const GoogleAd = require('../../models/mongo/GoogleAd');

// Add new Google Ad
exports.addGoogleAd = async (req, res) => {
  try {
    const image = req.file?.path;
    if (!image) return res.status(400).json({ message: "Image is required" });

    const ad = await GoogleAd.create({ image });
    res.status(201).json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all Google Ads
exports.getGoogleAds = async (req, res) => {
  try {
    const ads = await GoogleAd.find({}, { image: 1, isActive: 1 });
    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Google Ad image
exports.updateGoogleAd = async (req, res) => {
  try {
    const { id } = req.params;
    const image = req.file?.path;
    if (!image) return res.status(400).json({ message: "New image is required" });

    const ad = await GoogleAd.findByIdAndUpdate(id, { image }, { new: true });
    res.json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Toggle Ad isActive
exports.toggleGoogleAd = async (req, res) => {
  try {
    const { id } = req.params;
    const ad = await GoogleAd.findById(id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    ad.isActive = !ad.isActive;
    await ad.save();

    res.json({ success: true, ad });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
