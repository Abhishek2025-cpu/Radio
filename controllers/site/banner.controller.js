const SiteBanner = require('../../models/mongo/SiteBanner.model');

// No need to require cloudinary here unless you use it for other things like deletion
// const cloudinary = require('../../utils/cloudinary');

exports.createBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;

    const image = req.files?.image?.[0]?.path || null;
    const video = req.files?.video?.[0]?.path || null;

    if (!type || !image) {
      return res.status(400).json({ message: "❌ 'type' and 'image' are required" });
    }

    const banner = new SiteBanner({
      type,
      title: title || null,
      content: content || null,
      image,
      video,
      link: link || null,
      active: active === 'false' || active === false ? false : true
    });

    const savedBanner = await banner.save();

    res.status(201).json({
      message: '✅ Site banner created successfully',
      banner: savedBanner
    });

  } catch (err) {
    console.error("Error creating banner:", err);
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};



exports.getBanners = async (req, res) => {
  try {
    const banners = await SiteBanner.find({ active: true }).sort({ createdAt: -1 });
    res.json(banners);
  } catch (err) {
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
    const { id } = req.params;
    const updateData = { ...req.body };

    // ✅ Handle new image upload
    if (req.files?.image?.length > 0) {
      updateData.image = req.files.image[0].path; // Save as string
    }

    // ✅ Handle new video upload
    if (req.files?.video?.length > 0) {
      updateData.video = req.files.video[0].path;
    }

    // ✅ Handle boolean properly
    if (updateData.active !== undefined) {
      updateData.active = updateData.active === 'true';
    }

    const updatedBanner = await SiteBanner.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedBanner) {
      return res.status(404).json({ error: '❌ Banner not found' });
    }

    res.status(200).json({
      message: '✅ Banner updated successfully',
      data: updatedBanner
    });

  } catch (err) {
    console.error("Update Banner Error:", err);
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};



exports.toggleBannerActive = async (req, res) => {
  try {
    const { active } = req.body;

    if (typeof active === "undefined") {
      return res.status(400).json({ error: '"active" field is required' });
    }

    const banner = await SiteBanner.findByIdAndUpdate(
      req.params.id,
      { active: active === "true" || active === true },
      { new: true }
    );

    if (!banner) {
      return res.status(404).json({ error: "Banner not found" });
    }

    res.status(200).json({
      message: `Banner is now ${banner.active ? "active" : "inactive"}`,
      data: banner,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
