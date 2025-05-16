const appBannerService = require('../../services/app/banner.service');

exports.createBanner = async (req, res) => {
  try {
    const {
      type,
      title,
      content,
      link,
      video,
      images // can be a single base64 string or an array of base64 strings
    } = req.body;

    // Ensure images is an array
    const imagesArray = typeof images === 'string' ? [images] : images;

    const payload = {
      type,
      title: title || null,
      content: content || null,
      link: link || null,
      video: video || null,
      images: imagesArray || [],
    };

    const banner = await appBannerService.createBanner(payload);
    res.status(201).json({
      success: true,
      message: 'App banner created successfully',
      data: banner
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};
