// // --- IMPORTS AND SETUP ---
// require('dotenv').config();
// const express = require("express");
// const fetch = require('node-fetch');
// const multer = require('multer');

// const connectDB = require('./config/db.mongo');
// const Station = require('./models/mongo/Station');
// const SongCoverOverride = require('./models/mongo/SongCoverOverride');
// const { uploadToCloudinary } = require('./utils/cloudinary');



// // --- INITIALIZE APP & MIDDLEWARE ---
// const app = express();
// app.use(express.json());

// // --- MULTER CONFIGURATION ---
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// // --- CONNECT TO DATABASE ---
// connectDB();

// // --- HELPER FUNCTIONS ---
// const createSongKey = (artist, title) => {
//   if (!artist || !title) return null;
//   return (artist + '_' + title).replace(/\s+/g, '_').toLowerCase();
// };

// const applyMetadataMapping = (liveData, mapping) => {
//   if (!liveData || !mapping || Object.keys(mapping).length === 0) return liveData;
//   const transformedData = {};
//   const mappingObject = mapping instanceof Map ? Object.fromEntries(mapping) : mapping;
//   for (const originalKey in liveData) {
//     const newKey = mappingObject[originalKey] || originalKey;
//     transformedData[newKey] = liveData[originalKey];
//   }
//   return transformedData;
// };

// // =================================================================
// // --- API ROUTES ---
// // =================================================================

// // --- CREATE a new station ---
// app.post('/api/create-station', upload.single('thumbnail'), async (req, res) => {
//     try {
//         if (req.file) {
//             const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
//             req.body.thumbnailUrl = uploadResult.secure_url;
//         }
//         const newStation = await Station.create(req.body);
//         res.status(201).json(newStation);
//     } catch (err) {
//         if (err.code === 11000) return res.status(409).json({ message: `Station with stationId '${req.body.stationId}' already exists.` });
//         if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });

// // --- READ all VISIBLE stations (for public app) ---
// app.get('/api/station', async (req, res) => {
//   try {
//     // IMPORTANT: Only find stations where isVisible is true
//     const stationsFromDB = await Station.find({ isVisible: true });
//     if (!stationsFromDB || stationsFromDB.length === 0) return res.json([]);

//     const stationDataPromises = stationsFromDB.map(async (station) => {
//       try {
//         const response = await fetch(station.infomaniakUrl);
//         if (!response.ok) throw new Error(`Fetch failed`);
        
//         const liveMetadata = await response.json();
//         let nowPlaying = liveMetadata.data;
        
//         // **FIXED: Calling the helper function**
//         const transformedNowPlaying = applyMetadataMapping(nowPlaying, station.metadataMapping);
        
//         return { ...station.toObject(), nowPlaying: transformedNowPlaying };
//       } catch (fetchError) {
//         return { ...station.toObject(), nowPlaying: { status: 'error', message: fetchError.message } };
//       }
//     });
//     const fullStationData = await Promise.all(stationDataPromises);
//     res.json(fullStationData);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// // --- READ all stations (for admin backoffice) ---
// app.get('/api/station/all', async (req, res) => {
//     try {
//         // This route fetches ALL stations, including hidden ones
//         const allStations = await Station.find().sort({ createdAt: -1 });
//         res.json(allStations);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });


// // --- READ a single station ---
// app.get('/api/station/:stationId', async (req, res) => {
//   try {
//     const stationId = req.params.stationId.toUpperCase();
//     const station = await Station.findOne({ stationId });
//     if (!station) return res.status(404).json({ message: 'Station not found' });
    
//     // You might want to prevent access to hidden stations here as well
//     // if (!station.isVisible) return res.status(404).json({ message: 'Station not found' });

//     const response = await fetch(station.infomaniakUrl);
//     if (!response.ok) throw new Error(`Infomaniak API error`);

//     const liveMetadata = await response.json();
//     let nowPlaying = liveMetadata.data;

//     // **FIXED: Calling the helper function**
//     const transformedNowPlaying = applyMetadataMapping(nowPlaying, station.metadataMapping);

//     const finalResponse = { ...station.toObject(), nowPlaying: transformedNowPlaying };
//     res.json(finalResponse);
//   } catch (err) {
//     res.status(500).json({ message: 'Server Error or failed to fetch' });
//   }
// });


// // --- UPDATE an existing station ---
// app.put('/api/station/:stationId', upload.single('thumbnail'), async (req, res) => {
//     try {
//         const stationId = req.params.stationId.toUpperCase();
//         if (req.file) {
//             const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
//             req.body.thumbnailUrl = uploadResult.secure_url;
//         }
//         const updatedStation = await Station.findOneAndUpdate({ stationId }, req.body, { new: true, runValidators: true });
//         if (!updatedStation) return res.status(404).json({ message: 'Station not found' });
//         res.json(updatedStation);
//     } catch (err) {
//         if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
//         res.status(500).send('Server Error');
//     }
// });


// // --- PATCH to update visibility (show/hide) ---
// app.patch('/api/station/:stationId/visibility', async (req, res) => {
//     try {
//         const { isVisible } = req.body;
//         if (typeof isVisible !== 'boolean') {
//             return res.status(400).json({ message: 'isVisible must be a boolean (true or false).' });
//         }
        
//         const stationId = req.params.stationId.toUpperCase();
//         const station = await Station.findOneAndUpdate(
//             { stationId },
//             { isVisible },
//             { new: true }
//         );
//         if (!station) return res.status(404).json({ message: 'Station not found.' });

//         res.json({ message: `Station '${station.name}' visibility set to ${station.isVisible}.`, station });
//     } catch (err) {
//         res.status(500).send('Server Error');
//     }
// });


// // --- DELETE a station ---
// app.delete('/api/station/:stationId', async (req, res) => {
//     try {
//         const stationId = req.params.stationId.toUpperCase();
//         const deletedStation = await Station.findOneAndDelete({ stationId });
//         if (!deletedStation) return res.status(404).json({ message: 'Station not found.' });

//         // Future improvement: Delete the associated thumbnail from Cloudinary here.
        
//         res.json({ message: `Station '${deletedStation.name}' was deleted successfully.` });
//     } catch (err) {
//         res.status(500).send('Server Error');
//     }
// });

// // --- START SERVER ---
// const PORT = process.env.PORT || 2026;
// app.listen(PORT, () => {
//   console.log(`uRadio server running on port ${PORT}`);
// });





const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");
const fetch = require('node-fetch');
const connectDB = require('./config/db.mongo');
const Station = require('./models/mongo/Station');
const SongCoverOverride = require('./models/mongo/SongCoverOverride');
// const { uploadToCloudinary } = require('./utils/cloudinary'); 

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });



const PORT = process.env.PORT || 2026;
// Initialize App

app.use(express.json());

// Connect to Database
connectDB();
// --- Helper Function ---
// Creates a consistent key for song lookups
const createSongKey = (artist, title) => {
  if (!artist || !title) return null;
  return (artist + '_' + title).replace(/\s+/g, '_').toLowerCase();
};

// --- HELPER FUNCTIONS ---
// (Your existing helper functions: createSongKey, applyMetadataMapping)


const applyMetadataMapping = (liveData, mapping) => {
  if (!liveData || !mapping || Object.keys(mapping).length === 0) return liveData;
  const transformedData = {};
  const mappingObject = mapping instanceof Map ? Object.fromEntries(mapping) : mapping;
  for (const originalKey in liveData) {
    const newKey = mappingObject[originalKey] || originalKey;
    transformedData[newKey] = liveData[originalKey];
  }
  return transformedData;
};

// --- API ROUTES ---

// GET /api/stations -> Get a list of all stations from our DB
app.get('/api/station', async (req, res) => {
  try {
    // 1. Get all stations from our database
    const stationsFromDB = await Station.find();

    if (!stationsFromDB || stationsFromDB.length === 0) {
      return res.json([]);
    }

    // 2. Create an array of promises, one for each station's metadata fetch
    const stationDataPromises = stationsFromDB.map(async (station) => {
      try {
        // Fetch live data for this specific station
        const response = await fetch(station.infomaniakUrl);
        if (!response.ok) {
            // If one station fails, don't crash the whole API.
            // Log the error and return a default "now playing" state.
            console.error(`Failed to fetch metadata for ${station.name}: ${response.statusText}`);
            return { ...station.toObject(), nowPlaying: { status: 'error', message: 'Could not fetch metadata' } };
        }
        const liveMetadata = await response.json();
        let nowPlaying = liveMetadata.data;

        // Check for a custom song cover override
        if (nowPlaying && nowPlaying.artist && nowPlaying.title) {
            const songKey = createSongKey(nowPlaying.artist, nowPlaying.title);
            const coverOverride = await SongCoverOverride.findOne({ songKey });
            if (coverOverride) {
                nowPlaying.cover = coverOverride.customCoverUrl;
            }
        }
        
        // Combine our DB data with the live data
        return {
          // Using .toObject() to get a plain JS object from the Mongoose document
          ...station.toObject(), 
          nowPlaying: nowPlaying,
        };

      } catch (fetchError) {
        console.error(`Error fetching for ${station.name}:`, fetchError);
        return { ...station.toObject(), nowPlaying: { status: 'error', message: 'Fetch failed' } };
      }
    });

    // 3. Wait for all the promises to resolve
    const fullStationData = await Promise.all(stationDataPromises);
    
    // 4. Send the complete array
    res.json(fullStationData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// GET /api/stations/:stationId -> The main endpoint we want
app.get('/api/stations/:stationId', async (req, res) => {
  try {
    // 1. Find the station in OUR database
    const stationId = req.params.stationId.toUpperCase();
    const myStationData = await Station.findOne({ stationId });

    if (!myStationData) {
      return res.status(404).json({ message: 'Station not found in our database' });
    }

    // 2. Fetch LIVE metadata from Infomaniak
    const response = await fetch(myStationData.infomaniakUrl);
    if (!response.ok) {
        throw new Error(`Infomaniak API returned status ${response.status}`);
    }
    const liveMetadata = await response.json();
    const nowPlaying = liveMetadata.data;

    // 3. Check for a custom song cover override
    if (nowPlaying && nowPlaying.artist && nowPlaying.title) {
        const songKey = createSongKey(nowPlaying.artist, nowPlaying.title);
        const coverOverride = await SongCoverOverride.findOne({ songKey });
        
        if (coverOverride) {
            console.log(`Found cover override for ${songKey}!`);
            nowPlaying.cover = coverOverride.customCoverUrl; // Replace the cover!
        }
    }

    // 4. MERGE and build the final response
    const finalResponse = {
      name: myStationData.name,
      streamUrl: myStationData.customStreamUrl, // Our custom URL
      thumbnail: myStationData.thumbnailUrl,      // Our custom thumbnail
      color: myStationData.color,                // Our custom color
      nowPlaying: nowPlaying,                    // The (potentially modified) live data
    };

    // 5. Send it!
    res.json(finalResponse);

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error or failed to fetch from Infomaniak' });
  }
});


// app.post('/api/add-station', upload.single('thumbnail'), async (req, res) => {
//     try {
//         // If a thumbnail file was uploaded, send it to Cloudinary
//         if (req.file) {
//             const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
//             // Add the secure Cloudinary URL to the request body before saving
//             req.body.thumbnailUrl = uploadResult.secure_url;
//         }

//         const newStation = await Station.create(req.body);
//         res.status(201).json(newStation);
//     } catch (err) {
//         if (err.code === 11000) return res.status(409).json({ message: `Station with stationId '${req.body.stationId}' already exists.` });
//         if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });


// // --- UPDATE an existing station ---
// // PUT /api/stations/:stationId (Now handles file uploads)
// app.put('/api/update-station/:stationId', upload.single('thumbnail'), async (req, res) => {
//     try {
//         const stationId = req.params.stationId.toUpperCase();

//         // If a new thumbnail file was uploaded, send it to Cloudinary
//         if (req.file) {
//             const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
//             // Add/overwrite the thumbnailUrl in the request body
//             req.body.thumbnailUrl = uploadResult.secure_url;
//         }

//         const updatedStation = await Station.findOneAndUpdate(
//             { stationId },
//             req.body,
//             { new: true, runValidators: true }
//         );
//         if (!updatedStation) return res.status(404).json({ message: 'Station not found' });
        
//         res.json(updatedStation);
//     } catch (err) {
//         if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// });


(async () => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
