const AppBanner = require('../../models/mongo/AppBanner.model');// Placeholder content for AppBanner.model.js

exports.createBanner = async (req, res) => {
  try {
    const {
      type, title, content, video, link, active
    } = req.body;

    let images = [];

    // Convert uploaded images to base64
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
    }

    const banner = new AppBanner({
      type,
      title: title || null,
      content: content || null,
      images,
      video: video || null,
      link: link || null,
      active: active !== undefined ? active === 'true' : true
    });

    const savedBanner = await banner.save();
    res.status(201).json({
      message: '✅ Banner created successfully',
      banner: savedBanner
    });

  } catch (err) {
    res.status(400).json({ error: `❌ ${err.message}` });
  }  res.status(500).json({ error: `❌ ${err.message}` });
 
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
