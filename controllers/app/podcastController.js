const Podcast = require('../../models/mongo/Podcast');
const { cloudinary } = require('../../utils/cloudinaryConfig'); // assuming config file is in utils

// Add Podcast with image upload (form-data)
exports.createPodcast = async (req, res) => {
  try {
    const podcastData = req.body;

    // If an image file is uploaded
   if (req.file) {
  podcastData.image = req.file.originalname; // or req.file.filename
  podcastData.imageUrl = req.file.path;      // Cloudinary URL
}
    const podcast = new Podcast(podcastData);
    await podcast.save();
    res.status(201).json(podcast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get All Podcasts
exports.getAllPodcasts = async (req, res) => {
  const podcasts = await Podcast.find().sort({ timestamp: -1 });
  res.json(podcasts);
};

// Get Podcast by ID
exports.getPodcastById = async (req, res) => {
  const podcast = await Podcast.findById(req.params.id);
  if (!podcast) return res.status(404).json({ error: 'Not found' });
  res.json(podcast);
};

// Update Podcast and optionally update image
exports.updatePodcast = async (req, res) => {
  try {
    const updateData = req.body;

    if (req.file) {
      updateData.imageUrl = req.file.path; // Cloudinary image URL
    }

    const updated = await Podcast.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Podcast
exports.deletePodcast = async (req, res) => {
  const deleted = await Podcast.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
};
