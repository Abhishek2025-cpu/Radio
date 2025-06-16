// controllers/podcastController.js
const Podcast = require('../models/Podcast');

exports.createPodcast = async (req, res) => {
  try {
    const podcast = new Podcast(req.body);
    await podcast.save();
    res.status(201).json(podcast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllPodcasts = async (req, res) => {
  const podcasts = await Podcast.find().sort({ timestamp: -1 });
  res.json(podcasts);
};

exports.getPodcastById = async (req, res) => {
  const podcast = await Podcast.findById(req.params.id);
  if (!podcast) return res.status(404).json({ error: 'Not found' });
  res.json(podcast);
};

exports.updatePodcast = async (req, res) => {
  const updated = await Podcast.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
};

exports.deletePodcast = async (req, res) => {
  const deleted = await Podcast.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Deleted' });
};
