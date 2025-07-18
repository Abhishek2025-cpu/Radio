const News = require('../../models/mongo/news');
const splitTextByCharLength = require('../../utils/textSplitter');
// Your Cloudinary helper should upload from a buffer, which is correct
const { uploadToCloudinary } = require('../../utils/cloudinary'); 

exports.createNews = async (req, res) => {
  try {
    const { author, heading, paragraph, subParagraph } = req.body;

    // --- Validation ---
    if (!heading || !paragraph || !author) {
      return res.status(400).json({ error: "Missing required fields: author, heading, and paragraph." });
    }
    // Check if files were actually uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one media file (image, audio, or video) is required." });
    }

    const imageUrls = [];
    const audioUrls = [];
    const videoUrls = [];

    // --- Process Uploaded Files in Parallel ---
    const uploadPromises = req.files.map(file => {
      // Pass the file's buffer to your Cloudinary uploader
      return uploadToCloudinary(file.buffer, {
        resource_type: 'auto', // Let Cloudinary detect the type
        folder: 'news-media'   // Organize uploads into a folder
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    // --- Sort URLs by Type ---
    uploadResults.forEach((result, index) => {
      const originalFile = req.files[index];
      if (result.resource_type === 'image') {
        imageUrls.push(result.secure_url);
      } else if (originalFile.mimetype.startsWith('audio/')) {
        audioUrls.push(result.secure_url);
      } else if (originalFile.mimetype.startsWith('video/')) {
        videoUrls.push(result.secure_url);
      }
    });

    // --- Create Database Entry ---
    const newEntry = await News.create({
      author,
      heading,
      paragraphChunks: splitTextByCharLength(paragraph),
      subParagraphChunks: subParagraph ? splitTextByCharLength(subParagraph) : [],
      imageUrls,
      audioUrls,
      videoUrls,
      visible: true,
    });

    return res.status(201).json({ message: 'News created successfully.', news: newEntry });

  } catch (err) {
    console.error("❌ Error in createNews:", err);
    return res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
};


// --- THIS IS THE FIXED FUNCTION ---
exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, heading, paragraph, subParagraph } = req.body;

    // Build the update object for text fields
    const textUpdateData = {};
    if (author) textUpdateData.author = author;
    if (heading) textUpdateData.heading = heading;
    if (paragraph) textUpdateData.paragraphChunks = splitTextByCharLength(paragraph);
    if (subParagraph) textUpdateData.subParagraphChunks = splitTextByCharLength(subParagraph);

    // Handle file uploads using the new, flexible logic
    // NOTE: This logic REPLACES existing files. If you upload new images, the old ones will be removed.
    const files = req.files || [];
    if (files.length > 0) {
      const imageUrls = [];
      const audioUrls = [];
      const videoUrls = [];

      for (const file of files) {
        if (file.mimetype.startsWith('image/')) {
          imageUrls.push(file.path);
        } else if (file.mimetype.startsWith('audio/')) {
          audioUrls.push(file.path);
        } else if (file.mimetype.startsWith('video/')) {
          videoUrls.push(file.path);
        }
      }
      
      // Add the new file arrays to the update object, using the CORRECT field names
      if (imageUrls.length > 0) textUpdateData.imageUrls = imageUrls;
      if (audioUrls.length > 0) textUpdateData.audioUrls = audioUrls;
      if (videoUrls.length > 0) textUpdateData.videoUrls = videoUrls;
    }

    // Check if there is anything to update
    if (Object.keys(textUpdateData).length === 0) {
        return res.status(400).json({ error: 'No update data provided.' });
    }

    console.log("📦 Final Payload to Update:", textUpdateData);

    const updatedNews = await News.findByIdAndUpdate(
      id, 
      { $set: textUpdateData }, // Use $set to update fields
      { new: true, runValidators: true } // Options to return the new doc and run schema validations
    );

    if (!updatedNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    res.status(200).json({ message: 'News updated successfully', data: updatedNews });

  } catch (error) {
    console.error("❌ Error in updateNews:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};


// --- The rest of the functions are simple and likely correct ---
exports.getSingleNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch single news', details: err.message });
  }
};



// Public API: Only visible news
exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find({ visible: true }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
  }
};

// Admin API: All news, regardless of visibility
exports.getAllNewsAdmin = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all news for admin', details: err.message });
  }
};
exports.toggleNewsVisibility = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    news.visible = !news.visible;
    await news.save();

    res.status(200).json({ message: `News visibility set to ${news.visible}`, data: news });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle visibility', details: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'News not found' });
    res.status(200).json({ message: 'News deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news', details: err.message });
  }
};