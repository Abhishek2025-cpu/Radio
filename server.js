const app = require('./app');
const connectMongo = require('./config/db.mongo');
const express = require("express");
const axios = require("axios");
const fetch = require('node-fetch');
const connectDB = require('./config/db.mongo');
const Station = require('./models/mongo/Station');
const SongCoverOverride = require('./models/mongo/SongCoverOverride');



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


(async () => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();
