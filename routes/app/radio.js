// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const https = require('https');
// const { v4: uuidv4 } = require('uuid');
// const streamifier = require('streamifier');


// const multer = require('multer');
// const { cloudinary, storage } = require('../../utils/cloudinary');

// const upload = multer({ storage });

// const agent = new https.Agent({ family: 4 });

// const stations = [
//   {
//     name: 'U80',
//     url: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
//     streamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac',
//   },
//   {
//     name: 'U90',
//     url: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover',
//     streamUrl: 'https://u90.ice.infomaniak.ch/u90-128.aac',
//   },
//   {
//     name: 'UDANCE',
//     url: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover',
//     streamUrl: 'https://udance.ice.infomaniak.ch/udance-128.aac',
//   },
//   {
//     name: 'UPOP',
//     url: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover',
//     streamUrl: 'https://upop.ice.infomaniak.ch/upop-128.aac',
//   },
//   {
//     name: 'URADIO',
//     url: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover',
//     streamUrl: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac',
//   },
//   {
//     name: 'URBAN',
//     url: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover',
//     streamUrl: 'https://urban.ice.infomaniak.ch/urban-128.aac',
//   },
// ];

// const customStationStore = new Map();

// const uploadToCloudinary = (buffer, filename) => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder: 'radio_thumbnails', public_id: filename, resource_type: 'image' },
//       (error, result) => {
//         if (result) resolve(result.secure_url);
//         else reject(error);
//       }
//     );
//     streamifier.createReadStream(buffer).pipe(stream);
//   });
// };

// // GET combined station data
// router.get('/stations', async (req, res) => {
//   try {
//     const results = await Promise.all(
//       stations.map(async ({ name, url, streamUrl }) => {
//         try {
//           const { data } = await axios.get(url, { httpsAgent: agent });
//           const metadata = Array.isArray(data) ? data.filter(d => d?.title && d.title !== '-') : [data];
//           const custom = customStationStore.get(name);
//           return {
//             name,
//             streamUrl: custom?.streamUrl || streamUrl,
//             metadata,
//             thumbnail_image: custom?.thumbnail_image || (data?.cover ?? ''),
//             color: custom?.color || '',
//           };
//         } catch (err) {
//           console.error(`Fetch error for ${name}:`, err.message);
//           return { name, streamUrl, metadata: [], error: true };
//         }
//       })
//     );
//     // Also include completely custom stations
//     for (const [name, meta] of customStationStore.entries()) {
//       if (!results.find(s => s.name === name)) {
//         results.push({ name, streamUrl: meta.streamUrl, metadata: [], ...meta });
//       }
//     }
//     res.json({ stations: results });
//   } catch (err) {
//     console.error('Unexpected error:', err.message);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // POST custom station
// router.post('/stations/change/:name', upload.single('thumbnail_image'), async (req, res) => {
//   try {
//     const { name } = req.params;
//     const { streamUrl, color } = req.body;

//     if (!name) return res.status(400).json({ error: 'Missing station name' });

//     const existing = customStationStore.get(name) || {};

//     let imageUrl = existing.thumbnail_image || '';
//     if (req.file) {
//       try {
//         imageUrl = await uploadToCloudinary(req.file.buffer, `${name}_${uuidv4()}`);
//       } catch (err) {
//         return res.status(500).json({ error: 'Image upload failed', details: err.message });
//       }
//     }

//     const updated = {
//       name,
//       streamUrl: streamUrl || existing.streamUrl || '',
//       color: color || existing.color || '',
//       thumbnail_image: imageUrl,
//     };

//     customStationStore.set(name, updated);
//     res.json({ message: 'Custom station added/updated', updated });
//   } catch (err) {
//     console.error('Unexpected server error:', err);
//     res.status(500).json({ error: 'Unexpected server error', details: err.message });
//   }
// });



// // GET single custom station
// router.get('/stations/custom/:name', (req, res) => {
//   const meta = customStationStore.get(req.params.name);
//   if (!meta) return res.status(404).json({ error: 'Station not found' });
//   res.json(meta);
// });

// // PUT update custom station
// router.put('/update-stations/:name', upload.single('thumbnail_image'), async (req, res) => {
//   const existing = customStationStore.get(req.params.name);
//   if (!existing) return res.status(404).json({ error: 'Station not found' });

//   const { streamUrl, color } = req.body;

//   let imageUrl = existing.thumbnail_image;
//   if (req.file) {
//     try {
//       imageUrl = await uploadToCloudinary(req.file.buffer, `${req.params.name}_${uuidv4()}`);
//     } catch (err) {
//       return res.status(500).json({ error: 'Image upload failed', details: err.message });
//     }
//   }

//   customStationStore.set(req.params.name, {
//     ...existing,
//     streamUrl: streamUrl || existing.streamUrl,
//     color: color || existing.color,
//     thumbnail_image: imageUrl
//   });

//   res.json({ message: 'Station updated' });
// });

// // DELETE custom station
// router.delete('/delete-stations/:name', (req, res) => {
//   const deleted = customStationStore.delete(req.params.name);
//   if (!deleted) return res.status(404).json({ error: 'Station not found' });
//   res.json({ message: 'Station deleted' });
// });


// module.exports = router;


// AI STUDIO CODE

const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
const streamifier = require('streamifier');

const multer = require('multer');
const { cloudinary, storage } = require('../../utils/cloudinary');

const upload = multer({ storage });

const agent = new https.Agent({ family: 4 });

// CORRECT: URLs are the updated V2 endpoints
const stations = [
  { name: 'U80', url: 'https://api.infomaniak.com/2/radio/8220/metadata', streamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac' },
  { name: 'U90', url: 'https://api.infomaniak.com/2/radio/8221/metadata', streamUrl: 'https://u90.ice.infomaniak.ch/u90-128.aac' },
  { name: 'UDANCE', url: 'https://api.infomaniak.com/2/radio/8200/metadata', streamUrl: 'https://udance.ice.infomaniak.ch/udance-128.aac' },
  { name: 'UPOP', url: 'https://api.infomaniak.com/2/radio/8222/metadata', streamUrl: 'https://upop.ice.infomaniak.ch/upop-128.aac' },
  { name: 'URADIO', url: 'https://api.infomaniak.com/2/radio/8113/metadata', streamUrl: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac' },
  { name: 'URBAN', url: 'https://api.infomaniak.com/2/radio/8173/metadata', streamUrl: 'https://urban.ice.infomaniak.ch/urban-128.aac' },
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
          // --- THE CRITICAL FIX: Add headers to the axios request ---
          const axiosOptions = {
            httpsAgent: agent,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
          };

          const { data: apiResponse } = await axios.get(url, axiosOptions);

          if (apiResponse.result !== 'success' || !apiResponse.data) {
            console.error(`API error for ${name}:`, apiResponse.error?.message || 'API result was not success or no data found');
            return { name, streamUrl, metadata: [], error: true, errorMessage: 'Failed to fetch metadata' };
          }
          
          const currentMetadata = apiResponse.data;
          const custom = customStationStore.get(name);
          const metadata = (currentMetadata.title && currentMetadata.title !== '-') ? [currentMetadata] : [];
          
          return {
            name,
            streamUrl: custom?.streamUrl || streamUrl,
            metadata,
            thumbnail_image: custom?.thumbnail_image || currentMetadata.cover || '',
            color: custom?.color || '',
          };
        } catch (err) {
          // --- IMPROVED ERROR LOGGING ---
          console.error(`❌ Fetch error for station: ${name} at URL: ${url}`);
          if (err.response) {
            console.error(`Status: ${err.response.status} | Data: ${JSON.stringify(err.response.data)}`);
          } else if (err.request) {
            console.error('No response received. Check network, DNS, or firewall.');
          } else {
            console.error('Error message:', err.message);
          }
          return { name, streamUrl, metadata: [], error: true, errorMessage: 'Upstream API request failed.' };
        }
      })
    );

    // Also include completely custom stations
    for (const [name, meta] of customStationStore.entries()) {
      if (!results.find(s => s.name === name)) {
        results.push({ name, ...meta, metadata: [] });
      }
    }

    res.json({ stations: results });
  } catch (err) {
    console.error('Unexpected error in /stations endpoint:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --- NO CHANGES NEEDED FOR THE ROUTES BELOW ---

// POST custom station (or create new)
router.post('/stations/change/:name', upload.single('thumbnail_image'), async (req, res) => {
  try {
    const { name } = req.params;
    const { streamUrl, color } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing station name' });

    const existing = customStationStore.get(name) || {};
    let imageUrl = existing.thumbnail_image || '';

    if (req.file) {
      try {
        imageUrl = await uploadToCloudinary(req.file.buffer, `${name}_${uuidv4()}`);
      } catch (err) {
        return res.status(500).json({ error: 'Image upload failed', details: err.message });
      }
    }

    const updated = {
      streamUrl: streamUrl || existing.streamUrl || '',
      color: color || existing.color || '',
      thumbnail_image: imageUrl,
    };

    customStationStore.set(name, updated);
    res.json({ message: 'Custom station added/updated', data: { name, ...updated } });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
});

// GET single custom station
router.get('/stations/custom/:name', (req, res) => {
  const meta = customStationStore.get(req.params.name);
  if (!meta) return res.status(404).json({ error: 'Station not found' });
  res.json({ name: req.params.name, ...meta });
});

// PUT update custom station
router.put('/update-stations/:name', upload.single('thumbnail_image'), async (req, res) => {
  const { name } = req.params;
  const existing = customStationStore.get(name);
  if (!existing) return res.status(404).json({ error: 'Station not found' });

  const { streamUrl, color } = req.body;
  let imageUrl = existing.thumbnail_image;

  if (req.file) {
    try {
      imageUrl = await uploadToCloudinary(req.file.buffer, `${name}_${uuidv4()}`);
    } catch (err) {
      return res.status(500).json({ error: 'Image upload failed', details: err.message });
    }
  }

  const updated = {
    ...existing,
    streamUrl: streamUrl || existing.streamUrl,
    color: color || existing.color,
    thumbnail_image: imageUrl,
  };

  customStationStore.set(name, updated);
  res.json({ message: 'Station updated', data: { name, ...updated } });
});

// DELETE custom station
router.delete('/delete-stations/:name', (req, res) => {
  const { name } = req.params;
  const deleted = customStationStore.delete(name);
  if (!deleted) return res.status(404).json({ error: 'Station not found' });
  res.json({ message: 'Station deleted' });
});


module.exports = router;