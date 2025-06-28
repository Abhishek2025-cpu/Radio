const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const { cloudinary, storage } = require('../../utils/cloudinary');

const upload = multer({ storage });

const agent = new https.Agent({ family: 4 });

const stations = [
  {
    name: 'U80',
    url: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
    streamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac',
  },
  {
    name: 'U90',
    url: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover',
    streamUrl: 'https://u90.ice.infomaniak.ch/u90-128.aac',
  },
  {
    name: 'UDANCE',
    url: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover',
    streamUrl: 'https://udance.ice.infomaniak.ch/udance-128.aac',
  },
  {
    name: 'UPOP',
    url: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover',
    streamUrl: 'https://upop.ice.infomaniak.ch/upop-128.aac',
  },
  {
    name: 'URADIO',
    url: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover',
    streamUrl: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac',
  },
  {
    name: 'URBAN',
    url: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover',
    streamUrl: 'https://urban.ice.infomaniak.ch/urban-128.aac',
  },
];

const customStationStore = new Map();

const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'radio_thumbnails', public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (result) resolve(result.secure_url);
        else reject(error);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// GET combined station data
router.get('/stations', async (req, res) => {
  try {
    const results = await Promise.all(
      stations.map(async ({ name, url, streamUrl }) => {
        try {
          const { data } = await axios.get(url, { httpsAgent: agent });
          const metadata = Array.isArray(data) ? data.filter(d => d?.title && d.title !== '-') : [data];
          const custom = customStationStore.get(name);
          return {
            name,
            streamUrl: custom?.streamUrl || streamUrl,
            metadata,
            thumbnail_image: custom?.thumbnail_image || (data?.cover ?? ''),
            color: custom?.color || '',
          };
        } catch (err) {
          console.error(`Fetch error for ${name}:`, err.message);
          return { name, streamUrl, metadata: [], error: true };
        }
      })
    );
    // Also include completely custom stations
    for (const [name, meta] of customStationStore.entries()) {
      if (!results.find(s => s.name === name)) {
        results.push({ name, streamUrl: meta.streamUrl, metadata: [], ...meta });
      }
    }
    res.json({ stations: results });
  } catch (err) {
    console.error('Unexpected error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST custom station
router.post('/stations/change', upload.single('thumbnail_image'), async (req, res) => {
  const { name, streamUrl, color } = req.body;
  if (!name || !streamUrl) return res.status(400).json({ error: 'Missing name or streamUrl' });

  let imageUrl = '';
  if (req.file) {
    try {
      imageUrl = await uploadToCloudinary(req.file.buffer, `${name}_${uuidv4()}`);
    } catch (err) {
      return res.status(500).json({ error: 'Image upload failed', details: err.message });
    }
  }

  customStationStore.set(name, {
    name,
    streamUrl,
    color,
    thumbnail_image: imageUrl
  });

  res.json({ message: 'Custom station added', name });
});

// GET single custom station
router.get('/stations/custom/:name', (req, res) => {
  const meta = customStationStore.get(req.params.name);
  if (!meta) return res.status(404).json({ error: 'Station not found' });
  res.json(meta);
});

// PUT update custom station
router.put('/update-stations/:name', upload.single('thumbnail_image'), async (req, res) => {
  const existing = customStationStore.get(req.params.name);
  if (!existing) return res.status(404).json({ error: 'Station not found' });

  const { streamUrl, color } = req.body;

  let imageUrl = existing.thumbnail_image;
  if (req.file) {
    try {
      imageUrl = await uploadToCloudinary(req.file.buffer, `${req.params.name}_${uuidv4()}`);
    } catch (err) {
      return res.status(500).json({ error: 'Image upload failed', details: err.message });
    }
  }

  customStationStore.set(req.params.name, {
    ...existing,
    streamUrl: streamUrl || existing.streamUrl,
    color: color || existing.color,
    thumbnail_image: imageUrl
  });

  res.json({ message: 'Station updated' });
});

// DELETE custom station
router.delete('/delete-stations/:name', (req, res) => {
  const deleted = customStationStore.delete(req.params.name);
  if (!deleted) return res.status(404).json({ error: 'Station not found' });
  res.json({ message: 'Station deleted' });
});


module.exports = router;
