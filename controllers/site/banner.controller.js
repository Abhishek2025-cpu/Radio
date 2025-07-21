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
    
    // 1. Start with the text data from the request body.
    const updateData = { ...req.body };

    // 2. Check for new image uploads.
    // The middleware (from your route) puts uploaded files into `req.files`.
    if (req.files?.images?.length > 0) {
      // Create a new array of Cloudinary URLs from the uploaded files.
      // This will completely overwrite the old image array in the database.
      updateData.images = req.files.images.map(file => file.path);
    }

    // 3. Check for a new video upload.
    if (req.files?.video?.length > 0) {
      // Get the new video's Cloudinary URL.
      // This will overwrite the old video URL in the database.
      updateData.video = req.files.video[0].path;
    }
    
    // 4. Handle the 'active' boolean status correctly.
    // HTML forms send 'true'/'false' as strings.
    if (updateData.active !== undefined) {
        updateData.active = updateData.active === 'true';
    }

    // 5. Find the banner by its ID and update it in the database.
    // The { new: true } option tells Mongoose to return the updated document.
    const updatedBanner = await SiteBanner.findByIdAndUpdate(id, updateData, { new: true });

    // If no banner was found with that ID, return an error.
    if (!updatedBanner) {
      return res.status(404).json({ error: '❌ Banner not found' });
    }

    // 6. Send the successful response.
    res.status(200).json({
      message: '✅ Banner updated successfully',
      data: updatedBanner
    });

  } catch (err) {
    // Handle any potential errors.
    console.error("Update Banner Error:", err);
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
