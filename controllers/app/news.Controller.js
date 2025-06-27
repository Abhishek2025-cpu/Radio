const News = require('../../models/mongo/news');
const splitTextByCharLength = require('../../utils/textSplitter');


exports.createNews = async (req, res) => {
  try {
    console.log("✅ BODY:", req.body);
    console.log("✅ FILES:", req.files);

    const { author, heading, paragraph, subParagraph } = req.body;

    if (!heading || !paragraph || !author) {
      return res.status(400).json({ error: "Missing required fields: heading, paragraph, or author." });
    }

    const images = req.files?.images?.map(file => file.path) || [];
    const audioUrl = req.files?.audio?.[0]?.path || null;

    console.log("🖼️ Image URLs:", images);
    console.log("🔊 Audio URL:", audioUrl);

    const paragraphChunks = splitTextByCharLength(paragraph);
    const subParagraphChunks = splitTextByCharLength(subParagraph || '');

    console.log("✂️ Paragraph Chunks:", paragraphChunks);
    console.log("✂️ SubParagraph Chunks:", subParagraphChunks);

    const dataToSave = {
      images,
      author,
      heading,
      paragraphChunks,
      subParagraphChunks,
      audioUrl
    };

    console.log("📦 Final Payload to Save:", dataToSave);

    const newNews = await News.create(dataToSave);

    res.status(201).json({ message: "News created", data: newNews });

  } catch (error) {
    console.error("❌ Error in createNews:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack,
    });
  }
};




exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

exports.getSingleNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { author, heading, paragraph, subParagraph } = req.body;

    const images = req.files?.images?.map(file => file.path) || [];
    const audioUrl = req.files?.audio?.[0]?.path;

    const paragraphChunks = paragraph ? splitTextByCharLength(paragraph) : undefined;
    const subParagraphChunks = subParagraph ? splitTextByCharLength(subParagraph) : undefined;

    const updateData = {
      ...(author && { author }),
      ...(heading && { heading }),
      ...(images.length > 0 && { images }),
      ...(audioUrl && { audioUrl }),
      ...(paragraphChunks && { paragraphChunks }),
      ...(subParagraphChunks && { subParagraphChunks }),
    };

    const updated = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ error: 'News not found' });

    res.status(200).json({ message: 'News updated', data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update news' });
  }
};

exports.toggleNewsVisibility = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ error: 'News not found' });

    news.visible = !news.visible;
    await news.save();

    res.status(200).json({ message: `News ${news.visible ? 'shown' : 'hidden'}`, data: news });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'News not found' });

    res.status(200).json({ message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete news' });
  }
};


