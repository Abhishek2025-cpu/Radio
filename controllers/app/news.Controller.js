// In controllers/app/news.Controller.js

const News = require('../../models/mongo/news');
const splitTextByCharLength = require('../../utils/textSplitter');
// This import should now be correct from our last fix
const { uploadToCloudinary } = require('../../utils/uploadToCloudinary');

exports.createNews = async (req, res) => {
  try {
    const { author, heading, paragraph, subParagraph } = req.body;

    if (!heading || !paragraph || !author) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one media file is required." });
    }

    const imageUrls = [], audioUrls = [], videoUrls = [];

    // --- Process Uploaded Files in Parallel ---
    const uploadPromises = req.files.map(file => {
      //
      // --- THIS IS THE FIX ---
      // We must pass the file's mimetype string as the second argument,
      // not an options object.
      //
      // WRONG: return uploadToCloudinary(file.buffer, { resource_type: 'auto', ... });
      // CORRECT:
      return uploadToCloudinary(file.buffer, file.mimetype);
    });

    // Wait for all uploads to finish
    const uploadResults = await Promise.all(uploadPromises);

    // --- Sort URLs by Type ---
    uploadResults.forEach((result, index) => {
      const originalMimetype = req.files[index].mimetype;
      if (result.resource_type === 'image') {
        imageUrls.push(result.secure_url);
      } else if (originalMimetype.startsWith('audio/')) {
        audioUrls.push(result.secure_url);
      } else if (originalMimetype.startsWith('video/')) {
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
    const { author, heading, paragraph, subParagraph, visible } = req.body;

    // 1. Find the existing news article first. This is crucial.
    const existingNews = await News.findById(id);
    if (!existingNews) {
      return res.status(404).json({ error: 'News not found' });
    }

    // 2. Prepare the object for database update.
    const updateData = {};

    // Update text fields only if they are provided in the request
    if (author) updateData.author = author;
    if (heading) updateData.heading = heading;
    if (paragraph) updateData.paragraphChunks = splitTextByCharLength(paragraph);
    if (subParagraph) updateData.subParagraphChunks = splitTextByCharLength(subParagraph);
    if (visible !== undefined) updateData.visible = visible === 'true';

    // 3. Handle NEW file uploads
    if (req.files && req.files.length > 0) {
      // Upload all new files to Cloudinary in parallel
      const uploadPromises = req.files.map(file =>
        uploadToCloudinary(file.buffer, file.mimetype)
      );
      const uploadResults = await Promise.all(uploadPromises);

      // Initialize new file URL arrays
      const newImageUrls = [];
      const newAudioUrls = [];
      const newVideoUrls = [];

      // Sort the new URLs based on their type
      uploadResults.forEach((result, index) => {
        const originalMimetype = req.files[index].mimetype;
        if (result.resource_type === 'image') {
          newImageUrls.push(result.secure_url);
        } else if (originalMimetype.startsWith('audio/')) {
          newAudioUrls.push(result.secure_url);
        } else if (originalMimetype.startsWith('video/')) {
          newVideoUrls.push(result.secure_url);
        }
      });

      // 4. MERGE old URLs with new URLs
      // This keeps existing files and adds the new ones.
      updateData.imageUrls = [...existingNews.imageUrls, ...newImageUrls];
      updateData.audioUrls = [...existingNews.audioUrls, ...newAudioUrls];
      updateData.videoUrls = [...existingNews.videoUrls, ...newVideoUrls];
    }

    // 5. Update the document in the database
    const updatedNews = await News.findByIdAndUpdate(
      id,
      { $set: updateData }, // Use $set to update only the provided fields
      { new: true } // This option returns the updated document
    );

    res.status(200).json({ message: 'News updated successfully', data: updatedNews });

  } catch (error) {
    console.error("❌ Error in updateNews:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
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