const AppBanner = require('../../models/mongo/AppBanner.model');// Placeholder content for AppBanner.model.js
const saveBase64File = require('../../utils/saveBase64File');

exports.createBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;

    // Process uploaded files
    let images = [];
    let video = null;

    if (req.files['images']) {
      images = req.files['images'].map(file => file.path);
    }

    if (req.files['video'] && req.files['video'][0]) {
      video = req.files['video'][0].path;
    }

    const banner = new AppBanner({
      type,
      title,
      content,
      images,
      video,
      link,
      active: active === 'true' || active === true
    });

    await banner.save();

    res.status(201).json({
      message: '✅ Banner created successfully',
      data: banner
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


exports.getBanners = async (req, res) => {
  try {
    const banners = await AppBanner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


// PUT /api/app/update-banner/:id
exports.updateBanner = async (req, res) => {
  try {
    const banner = await AppBanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner updated successfully', data: banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PATCH /api/app/update-field/:id
exports.updateBannerField = async (req, res) => {
  try {
    const banner = await AppBanner.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Field updated successfully', data: banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE /api/app/delete-banner/:id
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await AppBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
