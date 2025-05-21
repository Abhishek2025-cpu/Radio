const SiteBanner = require('../../models/mongo/SiteBanner.model');
const cloudinary = require('../../utils/cloudinary'); // adjust path as needed

exports.createBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;
    let images = [];
    let video = null;

    // Upload images to Cloudinary
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of imageFiles) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'banners/images' });
        images.push(result.secure_url);
      }
    }

    // Upload video to Cloudinary
    if (req.files && req.files.video) {
      const videoFile = Array.isArray(req.files.video) ? req.files.video[0] : req.files.video;
      const result = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'banners/videos'
      });
      video = result.secure_url;
    }

    const banner = new SiteBanner({
      type,
      title: title || null,
      content: content || null,
      images,
      video,
      link: link || null,
      active: active !== undefined ? active : true
    });

    const savedBanner = await banner.save();
    res.status(201).json({
      message: '✅ Site banner created successfully',
      banner: savedBanner
    });

  } catch (err) {
    res.status(400).json({ error: `❌ ${err.message}` });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await SiteBanner.find().sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};