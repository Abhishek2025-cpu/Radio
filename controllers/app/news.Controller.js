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

