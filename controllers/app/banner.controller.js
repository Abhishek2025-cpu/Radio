const AppBanner = require('../../models/mongo/AppBanner.model');// Placeholder content for AppBanner.model.js
const cloudinary = require('../../utils/cloudinary');




exports.createBanner = async (req, res) => {
  try {
    // 1. Destructure all fields directly from the body, including 'time'
    const { type, title, content, link, active, time } = req.body;

    // 2. Initialize the images object to null
    let images = null;
    
    // 3. Check if an image file was uploaded
    // Note: We use 'image' (singular) to match the router config below
    if (req.files && req.files.image && req.files.image[0]) {
      // 4. If a file exists, create the single image object
      images = {
        url: req.files.image[0].path, // The Cloudinary URL
        time: time || null            // The corresponding time from the form body
      };
    }

    const video = req.files?.video?.[0]?.path || null;

    const banner = new AppBanner({
      type,
      title,
      content,
      images, // Pass the single object (or null) here
      video,
      link,
      active: active === 'false' || active === false ? false : true
    });

    await banner.save();

    res.status(201).json({
      message: '✅ Banner created successfully',
      data: banner
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


exports.getBanners = async (req, res) => {
  try {
    const banners = await AppBanner.find({
      $or: [{ active: true }, { active: { $exists: false } }]
    }).sort({ createdAt: -1 }).select('-__v');

    res.status(200).json({
      message: '✅ Banners fetched successfully',
      data: banners
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


// GET /api/app/admin-get-banners
exports.adminGetBanners = async (req, res) => {
  try {
    const banners = await AppBanner.find().sort({ createdAt: -1 }).select('-__v');
    res.status(200).json({
      message: '✅ Admin banners fetched successfully',
      data: banners
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};



exports.updateBanner = async (req, res) => {
  try {
    const { type, title, content, link, active, time } = req.body;

    // Handle image (single)
    let imageObj = null;
    if (req.files?.image?.[0]) {
      const file = req.files.image[0];
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'app-banners/images'
      });
      imageObj = {
        url: result.secure_url,
        time: time || null
      };
    } else if (req.body.image) {
      imageObj = {
        url: req.body.image,
        time: time || null
      };
    }

    // Handle video (single)
    let videoUrl = null;
    if (req.files?.video?.[0]) {
      const result = await cloudinary.uploader.upload(req.files.video[0].path, {
        resource_type: 'video',
        folder: 'app-banners/videos'
      });
      videoUrl = result.secure_url;
    } else if (req.body.video) {
      videoUrl = req.body.video;
    }

    // Build update object
    const updateData = {
      type,
      title,
      content,
      link,
      active: active === 'true' || active === true,
      video: videoUrl,
      images: imageObj
    };

    const banner = await AppBanner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    res.json({ message: 'Banner updated successfully', data: banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PATCH /api/app/update-field/:id
// PATCH /api/app/toggle-active/:id
exports.toggleBannerActive = async (req, res) => {
  try {
    // expects { active: true } or { active: false } in req.body
    if (typeof req.body.active === 'undefined') {
      return res.status(400).json({ error: 'active field is required' });
    }

    const banner = await AppBanner.findByIdAndUpdate(
      req.params.id,
      { $set: { active: req.body.active } },
      { new: true }
    );
    if (!banner) return res.status(404).json({ error: 'Banner not found' });

    res.json({
      message: `Banner is now ${banner.active ? 'active' : 'inactive'}`,
      data: banner
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// DELETE /api/app/delete-banner/:id
exports.deleteBanner = async (req, res) => {
  try {
    const banner = await AppBanner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
