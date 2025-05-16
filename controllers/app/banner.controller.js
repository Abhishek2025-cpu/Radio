const appBannerService = require('../../services/app/banner.service');

exports.createBanner = async (req, res) => {
  try {
    const banner = await appBannerService.createBanner(req.body);
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await appBannerService.getAllBanners();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
