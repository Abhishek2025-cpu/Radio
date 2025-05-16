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
