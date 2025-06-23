const Podcast = require('../../models/mongo/Podcast');
const cloudinary = require('../../config/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');
// Caching latest 10 podcasts
let latestPodcastsCache = [];

// Multer in-memory
const upload = multer({ storage: multer.memoryStorage() });

// Utility: Upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder = 'podcasts/covers') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (result) resolve(result);
      else reject(error);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Get all podcasts
exports.getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find().sort({ createdAt: -1 });
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
};

// Get latest 10 from cache
exports.getLatestPodcasts = (_, res) => {
  res.json(latestPodcastsCache);
};

// Add podcast
exports.addPodcast = [
  upload.single('coverImage'),
  async (req, res) => {
    try {
      const { title, description, audioUrl, season, genre, subgenre } = req.body;

      let coverImageUrl = '';
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        coverImageUrl = result.secure_url;
      }

      const podcast = new Podcast({
        title,
        description,
        audioUrl,
        coverImageUrl,
        season,
        genre,
        subgenre
      });

      const saved = await podcast.save();

      // Update cache
      latestPodcastsCache.unshift(saved);
      if (latestPodcastsCache.length > 10) latestPodcastsCache.pop();

      res.status(201).json(saved);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Podcast creation failed' });
    }
  }
];

// Update podcast
exports.updatePodcast = [
  upload.single('coverImage'),
  async (req, res) => {
    try {
      const update = { ...req.body };

      // If new cover image is sent
      if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer);
        update.coverImageUrl = result.secure_url;
      }

      const updated = await Podcast.findByIdAndUpdate(req.params.id, update, { new: true });

      // Update cache
      const idx = latestPodcastsCache.findIndex(p => p._id.toString() === updated._id.toString());
      if (idx !== -1) latestPodcastsCache[idx] = updated;

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Podcast update failed' });
    }
  }
];

// Delete podcast
exports.deletePodcast = async (req, res) => {
  try {
    const deleted = await Podcast.findByIdAndDelete(req.params.id);

    // Remove from cache
    latestPodcastsCache = latestPodcastsCache.filter(p => p._id.toString() !== req.params.id);

    res.json({ message: 'Podcast deleted', deleted });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
};



// Initialize latestPodcastsCache from DB on server start
const initializeCache = async () => {
  try {
    const latest = await Podcast.find().sort({ createdAt: -1 }).limit(10);
    latestPodcastsCache = latest;
    console.log(`✅ Latest podcast cache initialized with ${latest.length} entries`);
  } catch (err) {
    console.error('❌ Failed to initialize latest podcast cache', err);
  }
};

initializeCache(); // Call immediately
