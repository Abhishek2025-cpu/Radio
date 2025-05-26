const News = require('../../models/mongo/news');
const splitTextByCharLength = require('../../utils/textSplitter');

exports.createNews = async (req, res) => {
  try {
    const { author, heading, paragraph, subParagraph } = req.body;

    const images = req.files['images']?.map(file => file.path) || [];
    const audioUrl = req.files['audio']?.[0]?.path || null;

    const paragraphChunks = splitTextByCharLength(paragraph, 300);
    const subParagraphChunks = splitTextByCharLength(subParagraph, 300);

    const news = await News.create({
      images,
      author,
      heading,
      paragraphChunks,
      subParagraphChunks,
      audioUrl
    });

    res.status(201).json({ message: 'News created successfully', news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create news', error: `❌ ${err.message}` });
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

