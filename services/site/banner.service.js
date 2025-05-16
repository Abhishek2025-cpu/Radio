const SiteBanner = require('../../models/mongo/SiteBanner.model');

exports.createBanner = async (data) => new SiteBanner(data).save();
exports.getAllBanners = async () => SiteBanner.find({ active: true });
