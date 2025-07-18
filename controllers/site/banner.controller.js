const SiteBanner = require('../../models/mongo/SiteBanner.model');
// No need to require cloudinary here unless you use it for other things like deletion
// const cloudinary = require('../../utils/cloudinary');

exports.createBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;

    // The middleware has already uploaded the files.
    // req.files.images is an array of files, and each file.path is the Cloudinary URL.
    const images = (req.files?.images || []).map(file => file.path);

    // req.files.video is an array with one file. Its path is the Cloudinary URL.
    const video = req.files?.video?.[0]?.path || null;

    const banner = new SiteBanner({
      type,
      title: title || null,
      content: content || null,
      images, // This is now an array of Cloudinary URLs
      video,  // This is now a single Cloudinary URL or null
      link: link || null,
      active: active === 'false' || active === false ? false : true
    });

    const savedBanner = await banner.save();

    res.status(201).json({
      message: '✅ Site banner created successfully',
      banner: savedBanner
    });

  } catch (err) {
    console.error("Error creating banner:", err); // Log the full error for debugging
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


exports.adminGetBanners = async (req, res) => {
  try {
    const banners = await SiteBanner.find().sort({ createdAt: -1 }).select('-__v');
    res.status(200).json({
      message: '✅ Admin site banners fetched successfully',
      data: banners
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


exports.updateBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;

    let images = [];
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      for (const file of imageFiles) {
        const result = await cloudinary.uploader.upload(file.path, { folder: 'banners/images' });
        images.push(result.secure_url);
      }
    } else if (req.body.images) {
      images = req.body.images; // expects array of URLs
    }

    let video = null;
    if (req.files && req.files.video) {
      const videoFile = Array.isArray(req.files.video) ? req.files.video[0] : req.files.video;
      const result = await cloudinary.uploader.upload(videoFile.path, {
        resource_type: 'video',
        folder: 'banners/videos'
      });
      video = result.secure_url;
    } else if (req.body.video) {
      video = req.body.video;
    }

    const updated = await SiteBanner.findByIdAndUpdate(
      req.params.id,
      { type, title, content, images, video, link, active },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: '❌ Banner not found' });

    res.json({ message: '✅ Site banner updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


exports.toggleBannerActive = async (req, res) => {
  try {
    if (typeof req.body.active === "undefined") {
      return res.status(400).json({ error: '❌ "active" field is required' });
    }

    const banner = await SiteBanner.findByIdAndUpdate(
      req.params.id,
      { $set: { active: req.body.active } },
      { new: true }
    );

    if (!banner) return res.status(404).json({ error: "❌ Banner not found" });

    // Emit real-time update
    const io = getIO();
    io.emit("banner-updated");

    res.json({
      message: `✅ Banner is now ${banner.active ? "active" : "inactive"}`,
      data: banner,
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};



exports.deleteBanner = async (req, res) => {
  try {
    const banner = await SiteBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: '❌ Banner not found' });

    res.json({ message: '✅ Site banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};
