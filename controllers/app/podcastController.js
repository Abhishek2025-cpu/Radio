const Genre = require('../../models/mongo/Genre');
const cloudinary = require('../../config/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');
const Podcast = require('../../models/mongo/Podcast'); // assuming correct path
let latestPodcastsCache = []; // initialize as an empty array


const upload = multer({ storage: multer.memoryStorage() });

const ftp = require('basic-ftp');

const uploadToFTP = async (buffer, fileName, remoteFolder = '/podcasts/covers') => {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS,
      secure: false,
    });

    await client.ensureDir(remoteFolder);
    await client.uploadFrom(Buffer.from(buffer), `${remoteFolder}/${fileName}`);
    
    client.close();

    const publicUrl = `http://${process.env.FTP_HOST}${remoteFolder}/${fileName}`;
    return publicUrl;
  } catch (err) {
    client.close();
    throw err;
  }
};


exports.uploadGenreCover = [
  upload.single('coverImage'),
  async (req, res) => {
    try {
      const { genreName } = req.params;

      if (!genreName) return res.status(400).json({ error: 'Genre name is required in URL param' });
      if (!req.file) return res.status(400).json({ error: 'No coverImage file uploaded' });

      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `${genreName.replace(/\s+/g, '_').toLowerCase()}.${fileExt}`;

      const coverImageUrl = await uploadToFTP(req.file.buffer, fileName);

      const genre = await Genre.findOneAndUpdate(
        { name: genreName },
        { name: genreName, coverImageUrl },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      res.status(200).json({
        message: 'Cover image uploaded successfully to FTP',
        genre
      });
    } catch (err) {
      console.error('❌ Upload Error:', err.message);
      res.status(500).json({ error: 'FTP Upload failed', details: err.message });
    }
  }
];



// GET /api/podcasts
exports.getAllPodcasts = async (_, res) => {
  try {
    const podcasts = await Podcast.find().sort({ createdAt: -1 });
    res.json(podcasts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
};

// GET /api/podcasts/latest
exports.getLatestPodcasts = async (_, res) => {
  res.json(latestPodcastsCache);
};

// POST /api/podcasts
exports.addPodcast = async (req, res) => {
  try {
    const { title, description, audioUrl, season, genre, subgenre } = req.body;

    if (!audioUrl) return res.status(400).json({ error: 'audioUrl is required' });

    const podcast = new Podcast({
      title,
      description,
      audioUrl,
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
};

// PUT /api/podcasts/:id
exports.updatePodcast = async (req, res) => {
  try {
    const { audioUrl, url, ...rest } = req.body;

    const update = { ...rest };
    if (audioUrl) update.audioUrl = audioUrl;
    else if (url) update.audioUrl = url; // normalize

    const updated = await Podcast.findByIdAndUpdate(req.params.id, update, { new: true });

    const idx = latestPodcastsCache.findIndex(p => p._id.toString() === updated._id.toString());
    if (idx !== -1) latestPodcastsCache[idx] = updated;

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// DELETE /api/podcasts/:id
exports.deletePodcast = async (req, res) => {
  try {
    const deleted = await Podcast.findByIdAndDelete(req.params.id);
    latestPodcastsCache = latestPodcastsCache.filter(p => p._id.toString() !== req.params.id);
    res.json({ message: 'Deleted', deleted });
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
