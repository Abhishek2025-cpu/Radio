const AppBanner = require('../../models/mongo/AppBanner.model');

exports.createBanner = async (data) => {
  const banner = new AppBanner(data);
  return await banner.save();
};

exports.getAllBanners = async () => {
  return await AppBanner.find().sort({ createdAt: -1 });
};
