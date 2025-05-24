const AppBanner = require('../../models/mongo/AppBanner.model');// Placeholder content for AppBanner.model.js
const cloudinary = require('../../utils/cloudinary');


exports.createBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;
    let times = req.body.time;
    if (!Array.isArray(times)) {
      // If only one time is sent, make it an array
      times = times ? [times] : [];
    }

    let images = [];
    if (req.files['images']) {
      for (let i = 0; i < req.files['images'].length; i++) {
        const file = req.files['images'][i];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'app-banners/images'
        });
        images.push({
          url: result.secure_url,
          time: times[i] || null // Assign corresponding time or null
        });
      }
    }

    let video = null;
    if (req.files['video'] && req.files['video'][0]) {
      const result = await cloudinary.uploader.upload(req.files['video'][0].path, {
        resource_type: 'video',
        folder: 'app-banners/videos'
      });
      video = result.secure_url;
    }

    const banner = new AppBanner({
      type,
      title,
      content,
      images,
      video,
      link,
      active: active === 'true' || active === true
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


// GET /api/app/get-banners
// GET /api/app/get-banners
exports.getBanners = async (req, res) => {
  try {
    // Populate only the fields you want, here all fields including images with time
    const banners = await AppBanner.find().sort({ createdAt: -1 }).select('-__v');
    res.status(200).json({
      message: '✅ Banners fetched successfully',
      data: banners
    });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};


// PUT /api/app/update-banner/:id
// PUT /api/app/update-banner/:id
exports.updateBanner = async (req, res) => {
  try {
    const { type, title, content, link, active } = req.body;
    let times = req.body.time;
    if (!Array.isArray(times)) {
      times = times ? [times] : [];
    }

    let images = [];
    if (req.files && req.files['images']) {
      for (let i = 0; i < req.files['images'].length; i++) {
        const file = req.files['images'][i];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'app-banners/images'
        });
        images.push({
          url: result.secure_url,
          time: times[i] || null
        });
      }
    } else if (req.body.images) {
      images = req.body.images; // expects array of {url, time}
    }

    let video = null;
    if (req.files && req.files['video'] && req.files['video'][0]) {
      const result = await cloudinary.uploader.upload(req.files['video'][0].path, {
        resource_type: 'video',
        folder: 'app-banners/videos'
      });
      video = result.secure_url;
    } else if (req.body.video) {
      video = req.body.video;
    }

    const updateData = {
      type,
      title,
      content,
      images,
      video,
      link,
      active: active === 'true' || active === true
    };

    const banner = await AppBanner.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Banner updated successfully', data: banner });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// PATCH /api/app/update-field/:id
exports.updateBannerField = async (req, res) => {
  try {
    let updateData = req.body;

    // If updating images or video via file upload
    if (req.files && req.files['images']) {
      let times = req.body.time;
      if (!Array.isArray(times)) {
        times = times ? [times] : [];
      }
      let images = [];
      for (let i = 0; i < req.files['images'].length; i++) {
        const file = req.files['images'][i];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'app-banners/images'
        });
        images.push({
          url: result.secure_url,
          time: times[i] || null
        });
      }
      updateData.images = images;
    }
    if (req.files && req.files['video'] && req.files['video'][0]) {
      const result = await cloudinary.uploader.upload(req.files['video'][0].path, {
        resource_type: 'video',
        folder: 'app-banners/videos'
      });
      updateData.video = result.secure_url;
    }

    const banner = await AppBanner.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );
    if (!banner) return res.status(404).json({ error: 'Banner not found' });
    res.json({ message: 'Field updated successfully', data: banner });
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
