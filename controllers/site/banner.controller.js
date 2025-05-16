const siteBannerService = require('../../services/site/banner.service');

exports.createBanner = async (req, res) => {
  try {
    const banner = await siteBannerService.createBanner(req.body);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await siteBannerService.getAllBanners();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
