const AppBanner = require('../../models/mongo/AppBanner.model');// Placeholder content for AppBanner.model.js
const cloudinary = require('../../utils/cloudinary');
console.log('req.files:', req.files);
console.log('req.body:', req.body);

exports.createBanner = async (req, res) => {
  try {
    const { type, title, content, link, active, time } = req.body;

    // Process uploaded files
    let images = [];
    let video = null;

    // Upload images to Cloudinary
    if (req.files['images']) {
      for (const file of req.files['images']) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'app-banners/images'
        });
        images.push(result.secure_url);
      }
    }

    // Upload video to Cloudinary
    if (req.files['video'] && req.files['video'][0]) {
      const result = await cloudinary.uploader.upload(req.files['video'][0].path, {
        resource_type: 'video',
        folder: 'app-banners/videos'
      });
      video = result.secure_url;
    }

    const banner = new AppBanner({
      type,
      title,
      content,
      images,
      video,
      link,
      time,
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


// GET /api/app/get-banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await AppBanner.find().sort({ createdAt: -1 });
    res.status(200).json({ data: banners });
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
