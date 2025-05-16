const AppBanner = require('../../models/mongo/AppBanner.model');

exports.createBanner = async (req, res) => {
  try {
    const {
      type, title, content, images, video, link, active
    } = req.body;

    const banner = new AppBanner({
      type,
      title: title || null,
      content: content || null,
      images: images ? images.split(',') : [], // base64 strings, comma-separated
      video: video || null,
      link: link || null,
      active: active !== undefined ? active : true
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
