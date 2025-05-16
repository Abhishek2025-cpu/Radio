const AppBanner = require('../../models/mongo/AppBanner.model');

exports.createBanner = async (data) => new AppBanner(data).save();
exports.getAllBanners = async () => AppBanner.find({ active: true });
