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
const { v4: uuidv4 } = require('uuid');
const streamifier = require('streamifier');

const multer = require('multer');
// Assuming cloudinary is configured correctly in this path
const { cloudinary } = require('../../utils/cloudinary');

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// This is our base list of stations.
const predefinedStations = [
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

// This stores all custom overrides and new stations.
// Format: { streamUrl?, metadataUrl?, color?, thumbnail_image? }
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

// --- THIS IS THE FULLY REBUILT AND CORRECTED ROUTE ---
router.get('/stations', async (req, res) => {
  try {
    // *** STEP 1: Create a unified list of all stations to be processed. ***
    const allStations = [];
    const stationMap = new Map();

    // Add predefined stations first
    predefinedStations.forEach(station => {
      stationMap.set(station.name, { ...station });
    });

    // Override with or add custom stations
    for (const [name, customData] of customStationStore.entries()) {
        // If it's a modification of a predefined station, update it
        if (stationMap.has(name)) {
            const existingStation = stationMap.get(name);
            stationMap.set(name, { ...existingStation, ...customData });
        } else {
            // If it's a completely new custom station, add it
            // It MUST have a streamUrl and a metadataUrl (url) to be useful
            stationMap.set(name, { name, ...customData, url: customData.metadataUrl });
        }
    }
    
    // Convert the map back to an array for Promise.all
    const stationsToFetch = Array.from(stationMap.values());

    // *** STEP 2: Fetch metadata for the unified list. ***
    const axiosOptions = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36' },
      timeout: 10000,
    };

    const resultsPromises = stationsToFetch.map(async (station) => {
      // If a custom station was added without a metadata URL, skip fetching
      if (!station.url) {
        return {
          name: station.name,
          streamUrl: station.streamUrl || '',
          metadata: [],
          thumbnail_image: station.thumbnail_image || '',
          color: station.color || '',
        };
      }

      try {
        const { data: apiResponse } = await axios.get(station.url, axiosOptions);
        
        // ** MORE ROBUST CHECK **: Ensure response is a valid object with the correct structure.
        if (apiResponse && apiResponse.result === 'success' && apiResponse.data) {
          const currentMetadata = apiResponse.data;
          // Check if there is valid song title information
          const metadata = (currentMetadata.title && currentMetadata.title !== '-') ? [currentMetadata] : [];

          return {
            name: station.name,
            streamUrl: station.streamUrl,
            metadata,
            thumbnail_image: station.thumbnail_image || currentMetadata.cover || '',
            color: station.color || '',
          };
        } else {
          // This handles cases where the API returns an error message or unexpected format
          console.error(`Invalid API response for ${station.name}:`, apiResponse);
          return {
            name: station.name,
            streamUrl: station.streamUrl,
            metadata: [],
            error: true,
            errorMessage: 'Invalid or failed API response.',
            thumbnail_image: station.thumbnail_image || '',
            color: station.color || '',
          };
        }
      } catch (err) {
        // This handles network errors (timeout, connection refused, etc.)
        console.error(`Axios fetch failed for ${station.name}:`, err.code, err.message);
        return {
          name: station.name,
          streamUrl: station.streamUrl,
          metadata: [],
          error: true,
          errorMessage: 'Upstream API request timed out or failed.',
          thumbnail_image: station.thumbnail_image || '',
          color: station.color || '',
        };
      }
    });

    const results = await Promise.all(resultsPromises);
    res.json({ stations: results });

  } catch (err) {
    console.error('FATAL UNEXPECTED ERROR in /stations endpoint:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- UPDATED ROUTE TO ACCEPT metadataUrl ---
router.post('/stations/change/:name', upload.single('thumbnail_image'), async (req, res) => {
  try {
    const { name } = req.params;
    // Now we accept 'metadataUrl'
    const { streamUrl, color, metadataUrl } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing station name' });

    const existing = customStationStore.get(name) || {};
    let imageUrl = existing.thumbnail_image || '';

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, `${name}_${uuidv4()}`);
    }
    
    const updated = {
      streamUrl: streamUrl || existing.streamUrl,
      color: color || existing.color,
      thumbnail_image: imageUrl,
      // Store the metadataUrl for custom stations
      metadataUrl: metadataUrl || existing.metadataUrl, 
    };
    
    customStationStore.set(name, updated);
    res.json({ message: 'Custom station added/updated', data: { name, ...updated } });
  } catch (err) {
    res.status(500).json({ error: 'Unexpected server error', details: err.message });
  }
});

// --- UPDATED ROUTE TO ACCEPT metadataUrl ---
router.put('/update-stations/:name', upload.single('thumbnail_image'), async (req, res) => {
    const { name } = req.params;
    const existing = customStationStore.get(name);
    if (!existing) return res.status(404).json({ error: 'Station not found' });

    // Now we accept 'metadataUrl'
    const { streamUrl, color, metadataUrl } = req.body;
    let imageUrl = existing.thumbnail_image;

    if (req.file) {
        imageUrl = await uploadToCloudinary(req.file.buffer, `${name}_${uuidv4()}`);
    }

    const updated = {
        ...existing,
        streamUrl: streamUrl || existing.streamUrl,
        color: color || existing.color,
        thumbnail_image: imageUrl,
        // Update the metadataUrl
        metadataUrl: metadataUrl || existing.metadataUrl,
    };

    customStationStore.set(name, updated);
    res.json({ message: 'Station updated', data: { name, ...updated } });
});


// --- Other routes remain the same ---
router.get('/stations/custom/:name', (req, res) => {
  const meta = customStationStore.get(req.params.name);
  if (!meta) return res.status(404).json({ error: 'Station not found' });
  res.json({ name: req.params.name, ...meta });
});

router.delete('/delete-stations/:name', (req, res) => {
  const { name } = req.params;
  const deleted = customStationStore.delete(name);
  if (!deleted) return res.status(404).json({ error: 'Station not found' });
  res.json({ message: 'Station deleted' });
});

module.exports = router;