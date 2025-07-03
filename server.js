
const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");
const multer = require('multer');
const fetch = require('node-fetch');
const connectDB = require('./config/db.mongo');
const Station = require('./models/mongo/Station');
const SongCoverOverride = require('./models/mongo/SongCoverOverride');
const { uploadToCloudinary } = require('./utils/cloudinary'); 

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



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




app.get('/api/station', async (req, res) => {
  try {
    // Only fetch visible stations
    const stationsFromDB = await Station.find({ isVisible: true });

    if (!stationsFromDB || stationsFromDB.length === 0) {
      return res.json([]);
    }

    const stationDataPromises = stationsFromDB.map(async (station) => {
      try {
        const response = await fetch(station.infomaniakUrl);
        if (!response.ok) {
          console.error(`Failed to fetch metadata for ${station.name}: ${response.statusText}`);
          return { ...station.toObject(), nowPlaying: { status: 'error', message: 'Could not fetch metadata' } };
        }
        const liveMetadata = await response.json();
        let nowPlaying = liveMetadata.data;

        if (nowPlaying && nowPlaying.artist && nowPlaying.title) {
          const songKey = createSongKey(nowPlaying.artist, nowPlaying.title);
          const coverOverride = await SongCoverOverride.findOne({ songKey });
          if (coverOverride) {
            nowPlaying.cover = coverOverride.customCoverUrl;
          }
        }

        return {
          ...station.toObject(),
          nowPlaying,
        };
      } catch (fetchError) {
        console.error(`Error fetching for ${station.name}:`, fetchError);
        return { ...station.toObject(), nowPlaying: { status: 'error', message: 'Fetch failed' } };
      }
    });

    const fullStationData = await Promise.all(stationDataPromises);
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




// =================================================================
// --- API ROUTES ---
// =================================================================

// --- CREATE a new station ---
// In your server file (e.g., server.js or app.js)

app.post('/api/create-station', upload.single('thumbnail'), async (req, res) => {
    try {
        const stationData = { ...req.body };

        if (req.file) {
            stationData.thumbnailUrl = req.file.path;
        }

        if (stationData.infomaniakUrl) {
            try {
                const metadataResponse = await axios.get(stationData.infomaniakUrl);

                if (metadataResponse.data && Array.isArray(metadataResponse.data.data)) {
                    
                    // THIS IS THE CORRECTED MAPPING LOGIC
                    stationData.nowPlaying = metadataResponse.data.data
                        .filter(item => item.title && item.title.trim() !== '-' && item.cover)
                        .map(item => {
                            // 1. Split "Title - Artist" string into two parts
                            const parts = item.title.split(' - ');
                            const title = parts[0] ? parts[0].trim() : 'Unknown Title';
                            const artist = parts[1] ? parts[1].trim() : 'Unknown Artist';

                            // 2. Return a NEW object with ALL the fields you need
                            return {
                                title: title,
                                artist: artist,
                                coverUrl: item.cover, // <-- THE IMPORTANT PART
                                playedAt: item.date,
                                duration: item.duration
                            };
                        });
                    
                    console.log(`Successfully fetched and parsed metadata for ${stationData.name || stationData.stationId}`);

                } else {
                    console.warn(`Metadata from ${stationData.infomaniakUrl} did not contain a 'data' array.`);
                    stationData.nowPlaying = [];
                }
            } catch (fetchError) {
                console.error(`Failed to fetch metadata from ${stationData.infomaniakUrl}:`, fetchError.message);
                stationData.nowPlaying = [];
            }
        }

        const newStation = await Station.create(stationData);
        res.status(201).json(newStation);

    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: `Station with stationId '${req.body.stationId}' already exists.` });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        console.error('An unexpected error occurred:', err);
        res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
});

// app.post('/api/create-station', upload.single('thumbnail'), async (req, res) => {
//     try {
//         // Create a mutable copy of the body to add/modify properties
//         const stationData = { ...req.body };

//         // 1. Handle Thumbnail Upload: Multer-Cloudinary automatically provides the URL
//         if (req.file) {
//             // The `path` from multer-storage-cloudinary is the secure URL
//             stationData.thumbnailUrl = req.file.path;
//         }

//         // 2. Fetch Live Metadata from Infomaniak URL
//         if (stationData.infomaniakUrl) {
//             try {
//                 const metadataResponse = await axios.get(stationData.infomaniakUrl);
//                 if (metadataResponse.data && metadataResponse.data.nowPlaying) {
//                     stationData.nowPlaying = metadataResponse.data.nowPlaying;
//                     console.log(`Successfully fetched metadata for ${stationData.name || stationData.stationId}`);
//                 } else {
//                     console.warn(`Metadata from ${stationData.infomaniakUrl} was fetched but did not contain a 'nowPlaying' field.`);
//                     stationData.nowPlaying = []; // Default to empty array
//                 }
//             } catch (fetchError) {
//                 // Log the error but allow station creation to proceed
//                 console.error(`Failed to fetch metadata from ${stationData.infomaniakUrl}:`, fetchError.message);
//                 stationData.nowPlaying = []; // Default to empty array on failure
//             }
//         }

//         // 3. Create the Station in the Database
//         const newStation = await Station.create(stationData);

//         // 4. Send Success Response
//         res.status(201).json(newStation);

//     } catch (err) {
//         // Handle Database and Validation Errors
//         if (err.code === 11000) {
//             return res.status(409).json({ message: `Station with stationId '${req.body.stationId}' already exists.` });
//         }
//         if (err.name === 'ValidationError') {
//             return res.status(400).json({ message: err.message });
//         }

//         // Handle Generic Server Errors
//         console.error('An unexpected error occurred:', err);
//         res.status(500).json({ message: 'An unexpected server error occurred.' });
//     }
// });



// --- READ all stations (for admin backoffice) ---

// This is the new ADMIN-ONLY API for your control panel.
// It fetches ALL stations so you can manage their visibility.
app.get('/api/station/all', async (req, res) => {
    try {
        // The key difference: .find({}) gets ALL stations, regardless of visibility.
        const stationsFromDB = await Station.find({}).sort({ name: 1 });

        const updatePromises = stationsFromDB.map(async (station) => {
            const stationObject = station.toObject();
            try {
                // The rest of the logic is the same: fetch the live metadata.
                const metadataResponse = await axios.get(station.infomaniakUrl, { timeout: 5000 });
                const songHistory = metadataResponse.data?.data;
                const currentSong = songHistory?.find(song => 
                    song.title && song.title.trim().length > 1 && song.title.trim() !== '-'
                );
                stationObject.nowPlaying = currentSong ? [currentSong] : [];
                return stationObject;
            } catch (error) {
                console.warn(`[API FALLBACK] Could not fetch live metadata for ${station.name}. Reason: ${error.message}.`);
                return stationObject;
            }
        });

        const liveStations = await Promise.all(updatePromises);
        res.json(liveStations);

    } catch (err) {
        console.error('Fatal error in /api/admin/station/all route:', err.message);
        res.status(500).send('Server Error');
    }
});

// // --- UPDATE an existing station ---
app.put('/api/station/:stationId', upload.single('thumbnail'), async (req, res) => {
    try {
        const stationId = req.params.stationId.toUpperCase();
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
            req.body.thumbnailUrl = uploadResult.secure_url;
        }
        const updatedStation = await Station.findOneAndUpdate({ stationId }, req.body, { new: true, runValidators: true });
        if (!updatedStation) return res.status(404).json({ message: 'Station not found' });
        res.json(updatedStation);
    } catch (err) {
        if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
        res.status(500).send('Server Error');
    }
});






// // --- PATCH to update visibility (show/hide) ---
app.patch('/api/station/:stationId/visibility', async (req, res) => {
    try {
        const { isVisible } = req.body;
        if (typeof isVisible !== 'boolean') {
            return res.status(400).json({ message: 'isVisible must be a boolean (true or false).' });
        }
        
        const stationId = req.params.stationId.toUpperCase();
        const station = await Station.findOneAndUpdate(
            { stationId },
            { isVisible },
            { new: true }
        );
        if (!station) return res.status(404).json({ message: 'Station not found.' });

        res.json({ message: `Station '${station.name}' visibility set to ${station.isVisible}.`, station });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// // --- DELETE a station ---
app.delete('/api/station/:stationId', async (req, res) => {
    try {
        const stationId = req.params.stationId.toUpperCase();
        const deletedStation = await Station.findOneAndDelete({ stationId });
        if (!deletedStation) return res.status(404).json({ message: 'Station not found.' });

        // Future improvement: Delete the associated thumbnail from Cloudinary here.
        
        res.json({ message: `Station '${deletedStation.name}' was deleted successfully.` });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});




(async () => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();




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

// GET /api/stations -> Get a list of all stations from our DB
// app.get('/api/station', async (req, res) => {
//   try {
//     // 1. Get all stations from our database
//     const stationsFromDB = await Station.find();

//     if (!stationsFromDB || stationsFromDB.length === 0) {
//       return res.json([]);
//     }

//     // 2. Create an array of promises, one for each station's metadata fetch
//     const stationDataPromises = stationsFromDB.map(async (station) => {
//       try {
//         // Fetch live data for this specific station
//         const response = await fetch(station.infomaniakUrl);
//         if (!response.ok) {
//             // If one station fails, don't crash the whole API.
//             // Log the error and return a default "now playing" state.
//             console.error(`Failed to fetch metadata for ${station.name}: ${response.statusText}`);
//             return { ...station.toObject(), nowPlaying: { status: 'error', message: 'Could not fetch metadata' } };
//         }
//         const liveMetadata = await response.json();
//         let nowPlaying = liveMetadata.data;

//         // Check for a custom song cover override
//         if (nowPlaying && nowPlaying.artist && nowPlaying.title) {
//             const songKey = createSongKey(nowPlaying.artist, nowPlaying.title);
//             const coverOverride = await SongCoverOverride.findOne({ songKey });
//             if (coverOverride) {
//                 nowPlaying.cover = coverOverride.customCoverUrl;
//             }
//         }
        
//         // Combine our DB data with the live data
//         return {
//           // Using .toObject() to get a plain JS object from the Mongoose document
//           ...station.toObject(), 
//           nowPlaying: nowPlaying,
//         };

//       } catch (fetchError) {
//         console.error(`Error fetching for ${station.name}:`, fetchError);
//         return { ...station.toObject(), nowPlaying: { status: 'error', message: 'Fetch failed' } };
//       }
//     });

//     // 3. Wait for all the promises to resolve
//     const fullStationData = await Promise.all(stationDataPromises);
    
//     // 4. Send the complete array
//     res.json(fullStationData);

//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });