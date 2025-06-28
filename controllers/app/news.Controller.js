const News = require('../../models/mongo/news');
const splitTextByCharLength = require('../../utils/textSplitter');

const mediaFiles = req.files || [];

for (const file of mediaFiles) {
  if (file.mimetype.startsWith('image/')) {
    imageUrls.push({ url: file.path, type: 'image' });
  } else if (file.mimetype.startsWith('audio/')) {
    audioUrls.push({ url: file.path, type: 'audio' });
  } else if (file.mimetype.startsWith('video/')) {
    videoUrls.push({ url: file.path, type: 'video' });
  }
}


// This function is CORRECT and does not need changes.
exports.createNews = async (req, res) => {
  try {
    const { author, heading, paragraph, subParagraph } = req.body;

    if (!heading || !paragraph || !author) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const imageUrls = [];
    const audioUrls = [];
    const videoUrls = [];
    const files = req.files || [];

    // --- THIS IS THE CORRECTED FILE HANDLING LOGIC ---
    // We loop through each file and manually upload its buffer to get a real URL
    for (const file of files) {
      try {
        // 1. Upload the file buffer using our helper
        const uploadResult = await uploadToCloudinary(file.buffer, file.mimetype);
        
        // 2. Get the real, secure URL from the result
        const fileUrl = uploadResult.secure_url;

        // 3. Push the REAL URL into the correct array
        if (uploadResult.resource_type === 'image') {
          imageUrls.push(fileUrl);
        } else if (uploadResult.resource_type === 'video') {
          // Cloudinary classifies audio as a 'video' resource type.
          // We can distinguish them using the original mimetype.
          if (file.mimetype.startsWith('audio/')) {
            audioUrls.push(fileUrl);
          } else {
            videoUrls.push(fileUrl);
          }
        }
      } catch (uploadError) {
        console.error("❌ Cloudinary upload failed for one of the files:", uploadError);
        // Decide how to handle a single failed upload. For now, we'll just skip it.
      }
    }

    console.log("🖼️ Final Image URLs:", imageUrls);
    console.log("🔊 Final Audio URLs:", audioUrls);
    console.log("📹 Final Video URLs:", videoUrls);

    // The rest of your code remains the same
    const paragraphChunks = splitTextByCharLength(paragraph);
    const subParagraphChunks = splitTextByCharLength(subParagraph || '');

    const dataToSave = {
      author,
      heading,
      paragraphChunks,
      subParagraphChunks,
      imageUrls,
      audioUrls,
      videoUrls,
    };

    const newNews = await News.create(dataToSave);
    res.status(201).json({ message: "News created successfully", data: newNews });

  } catch (error) {
    console.error("❌ Fatal Error in createNews:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
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

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find({ visible: true }).sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
  }
};

exports.getSingleNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news', details: err.message });
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