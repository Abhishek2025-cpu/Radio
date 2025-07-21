

const connectMongo = require('./config/db.mongo');
const mongoose = require('mongoose');

const axios = require("axios");
const multer = require('multer');
const cron = require('node-cron');
const fetch = require('node-fetch');

const Station = require('./models/mongo/Station');
const SongCoverOverride = require('./models/mongo/SongCoverOverride');

const stationThumbnailUploader = require('./middlewares/stationUpload');
const express = require('express');
const cors = require('cors');
const http = require("http");
const app = express();
require('dotenv').config();
require('./cron/voteResetJob');

const connectDB = require('./config/db.mongo');
const socket = require("./sockets/sockets");
const radioStationsRoutes = require("./routes/app/radioStationRoutes");
const artistRoutes = require('./routes/app/artistRoutes');
const server = http.createServer(app);
const io = socket.init(server);
connectDB();

const podcastRoutes = require('./routes/app/podcast.routes');

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const siteBannerRoutes = require('./routes/site/banner.routes');
const appBannerRoutes = require('./routes/app/banner.routes');
const newsRoutes = require('./routes/app/news.routes');
// const podcastRoutes = require('./routes/app/PodcastRoutes');
const radioRoutes = require('./routes/app/radio'); 
app.use('/api', radioRoutes);

app.use('/api/app', newsRoutes);
app.use("/api/radio-stations", radioStationsRoutes);
app.use('/api/podcasts',podcastRoutes);
// app.use('/api/podcast', podcastRoutes);
app.use('/api/performers', require('./routes/app/performerRoutes'));
app.use('/api/events', require('./routes/app/eventRoutes'));

app.use('/api/app', appBannerRoutes);
app.use('/api/site', siteBannerRoutes);
app.use('/api/form', require('./routes/app/FormSubmit'));
app.use('/api/artists', artistRoutes);
app.use('/api/websites', require('./routes/site/votingRoutes'));
app.use('/api/google-ads', require('./routes/app/googleAdRoutes'));
app.use('/api/contacts', require('./routes/app/contactRoutes'));
app.use('/api/game-banners', require('./routes/app/gameBannerRoutes'));
app.use('/api/games', require('./routes/app/gameRoutes'));
app.use('/api/participants', require('./routes/app/participantRoutes'));
app.use('/api/playbacks', require('./routes/app/playbackRoutes'));
app.use('/api/employees',require('./routes/app/employeeRoutes'));




require('./services/scheduler'); 



io.on("connection", (socket) => {
  console.log("🟢 Client connected via socket");

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected");
  });
});





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

app.post('/api/create-station', stationThumbnailUploader.single('thumbnail'), async (req, res) => {
    try {
        const stationData = { ...req.body };

        // THIS IS THE PAYOFF: req.file.path now contains the Cloudinary URL. No extra functions needed.
        if (req.file) {
            console.log('File uploaded successfully to Cloudinary:', req.file.path);
            stationData.thumbnailUrl = req.file.path;
        } else {
            console.log('No thumbnail file was provided.');
        }

        // --- All your other logic remains the same ---
        if (stationData.infomaniakUrl) {
           // ... (your metadata fetching code) ...
           const metadataResponse = await axios.get(stationData.infomaniakUrl);
           if (metadataResponse.data && Array.isArray(metadataResponse.data.data)) {
               stationData.nowPlaying = metadataResponse.data.data
                   .filter(item => item.title && item.title.trim() !== '-' && item.cover)
                   .map(item => {
                       const parts = item.title.split(' - ');
                       const title = parts[0] ? parts[0].trim() : 'Unknown Title';
                       const artist = parts[1] ? parts[1].trim() : 'Unknown Artist';
                       return {
                           title, artist,
                           coverUrl: item.cover,
                           playedAt: item.date,
                           duration: item.duration
                       };
                   });
           }
        }

        const newStation = await Station.create(stationData);
        res.status(201).json(newStation);

    } catch (err) {
        // ... (your error handling) ...
        console.error('Error creating station:', err);
        res.status(500).json({ message: 'An unexpected server error occurred.' });
    }
});




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
// In your main server file (e.g., app.js)

// No changes needed for multer setup
const updateFields = [
    { name: 'thumbnail', maxCount: 1 },
    { name: 'coverOverrideImage', maxCount: 1 }
];

// In your main server file (e.g., app.js)

// In your main server file (e.g., app.js)

app.put('/api/station/:stationId', stationThumbnailUploader.fields(updateFields), async (req, res) => {
    // <<--- THE ULTIMATE DIAGNOSTIC LOG --- >>
    console.log('API V6 (RETRY LOGIC) IS RUNNING FOR THIS REQUEST.'); 

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            const { stationId } = req.params;
            const station = await Station.findOne({ stationId: stationId.toUpperCase() });

            if (!station) {
                return res.status(404).json({ message: 'Station not found' });
            }

            // Update simple text fields
            const updatableFields = ['name', 'color', 'isVisible'];
            updatableFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    station[field] = req.body[field];
                }
            });

            // Update station thumbnail
            if (req.files && req.files.thumbnail) {
                station.thumbnailUrl = req.files.thumbnail[0].path;
            }

            // Update song cover override
            const { songTitle, songArtist, removeCoverOverride } = req.body;
            const coverOverrideImageFile = req.files && req.files.coverOverrideImage ? req.files.coverOverrideImage[0] : null;

            if (songTitle && songArtist) {
                const songToUpdate = station.nowPlaying.find(
                    song => song.title === songTitle && song.artist === songArtist
                );

                if (!songToUpdate) {
                    // This is a "clean" exit, not an error.
                    return res.status(404).json({ message: `Song "${songTitle}" by "${songArtist}" not found in this station's playlist.` });
                }

                if (coverOverrideImageFile) {
                    songToUpdate.coverUrlOverride = coverOverrideImageFile.path;
                } else if (removeCoverOverride === 'true' || removeCoverOverride === true) {
                    songToUpdate.coverUrlOverride = undefined;
                }
            }
            
            const updatedStation = await station.save();
            return res.status(200).json(updatedStation); 

        } catch (err) {
            if (err.name === 'VersionError') {
                attempts++;
                console.warn(`API UPDATE CONFLICT: Version conflict for ${req.params.stationId}. Retrying... (Attempt ${attempts}/${maxAttempts})`);
                if (attempts >= maxAttempts) {
                    return res.status(409).json({ message: 'Conflict: The station was updated by another process. Please try again.' });
                }
                await new Promise(resolve => setTimeout(resolve, 75));
           } else {
    // This is where the error is likely coming from.
    console.error('CRITICAL API ERROR:', err); // <--- THIS LINE IS EXECUTING
    return res.status(500).json({ message: 'An unexpected server error occurred.' });
}
        }
    }
});

// This task will run every 2 minutes. You can change the schedule.
//  cron job file

let isJobRunning = false; 

cron.schedule('*/2 * * * *', async () => {
    if (isJobRunning) {
        console.log('CRON JOB V5 (RETRY LOGIC): Skipping run, job already active.');
        return;
    }
    
    isJobRunning = true;
    console.log('CRON JOB V5 (RETRY LOGIC): Starting metadata update...');

    try {
        const stationsToProcess = await Station.find({ 
            infomaniakUrl: { $exists: true, $ne: null } 
        }).select('_id name').lean();

        for (const stationStub of stationsToProcess) {
            // <<-- DEFENSE AGAINST RACE CONDITION: ADD RETRY LOGIC -->>
            let attempts = 0;
            let success = false;
            const maxAttempts = 3; // Try up to 3 times

            while (attempts < maxAttempts && !success) {
                try {
                    const station = await Station.findById(stationStub._id);

                    if (!station) {
                        console.warn(`Station ${stationStub.name} not found, skipping.`);
                        break; // Exit the while loop for this station
                    }
                    
                    const overrideMap = station.nowPlaying.reduce((map, song) => { /* ... */ });
                    const metadataResponse = await axios.get(station.infomaniakUrl);

                    if (metadataResponse.data && Array.isArray(metadataResponse.data.data)) {
                        const newNowPlaying = metadataResponse.data.data
                            .filter(item => item.title && item.title.includes(' - ') && item.cover)
                            .map(item => { /* ... (parsing logic is correct) ... */ });
                        
                        station.nowPlaying = newNowPlaying;
                        await station.save();

                        console.log(`Successfully updated playlist for: ${station.name} on attempt #${attempts + 1}`);
                        success = true; // Mark as successful to exit the while loop
                    }
                } catch (error) {
                    // Check if it's the specific versioning error
                    if (error.name === 'VersionError') {
                        attempts++;
                        console.warn(`Version conflict for ${stationStub.name}. Retrying... (Attempt ${attempts}/${maxAttempts})`);
                        if (attempts >= maxAttempts) {
                            console.error(`Failed to update ${stationStub.name} after ${maxAttempts} attempts due to persistent version conflicts.`);
                        }
                        // Add a small delay before retrying to avoid hammering the DB
                        await new Promise(resolve => setTimeout(resolve, 50)); 
                    } else {
                        // It's a different error, so we should not retry.
                        console.error(`An unexpected error occurred for ${stationStub.name}:`, error.message);
                        break; // Exit the while loop
                    }
                }
            }
        }
    } catch (error) {
        console.error('A critical error occurred during the metadata update job:', error);
    } finally {
        isJobRunning = false;
        console.log('CRON JOB V5 (RETRY LOGIC): Metadata update finished. Lock released.');
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

app.get('/api/metadata-check', async (req, res) => {
    const channelId = req.query.channelId || req.query.channelID;

    if (!channelId) {
        return res.status(400).json({ error: 'channelId is required' });
    }

    try {
        // 1. Fetch "Now Playing" data from Infomaniak's public API
        const response = await axios.get(`https://api.radio-manager.net/radios/now_playing?radio_ids=${channelId}`);
        const metadata = response.data[0]; // Assuming the first result is our channel
        
        if (!metadata || !metadata.title) {
            return res.json({ show: false }); // No metadata, hide element
        }
        
        // 2. Apply custom logic based on the config file
        const result = applyRules(metadata, parseInt(channelId, 10));

        // 3. Send the decision to the frontend
        res.json(result);

    } catch (error) {
        console.error("Error fetching or processing metadata:", error.message);
        res.status(500).json({ error: 'Failed to fetch metadata' });
    }
});

function applyRules(metadata, channelId) {
    const channelConfig = config.channels.find(c => c.id === channelId);

    if (!channelConfig) {
        return { show: false, reason: 'No config for this channel.' }; // Default: hide
    }

    const [artist, title] = metadata.title.split(' - ');

    for (const rule of channelConfig.rules) {
        if (rule.type === 'artist_exact_match' && artist && artist.trim().toLowerCase() === rule.value.toLowerCase()) {
            return rule.display;
        }
        if (rule.type === 'title_contains' && title && title.toLowerCase().includes(rule.value.toLowerCase())) {
            return rule.display;
        }
    }

    // If no rules match, default to hiding the element
    return { show: false, reason: 'No matching rules.' };
}



app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});





(async () => {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`uRadio server running on port ${PORT}`);
  });
})();



