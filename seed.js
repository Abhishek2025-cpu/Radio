// File: scripts/importData.js

require('dotenv').config();
const axios = require('axios');
const connectDB = require('./config/db.mongo');// Adjust path if needed
const Station = require('./models/mongo/Station'); // Adjust path if needed
const SongCoverOverride = require('./models/mongo/SongCoverOverride'); // Adjust path if needed

// Connect to DB
connectDB();

const stations = [
  {
    stationId: 'U80',
    name: 'U80',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
    customStreamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac',
    thumbnailUrl: 'https://my-app.com/images/u80-thumb.png',
    color: '#E67E22',
  },
  {
    stationId: 'U90',
    name: 'U90',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover',
    customStreamUrl: 'https://u90.ice.infomaniak.ch/u90-128.aac',
    thumbnailUrl: 'https://my-app.com/images/u90-thumb.png',
    color: '#3498DB',
  },
  {
    stationId: 'UDANCE',
    name: 'UDANCE',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover',
    customStreamUrl: 'https://udance.ice.infomaniak.ch/udance-128.aac',
    thumbnailUrl: 'https://my-app.com/images/udance-thumb.png',
    color: '#9B59B6',
  },
  {
    stationId: 'UPOP',
    name: 'UPOP',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover',
    customStreamUrl: 'https://upop.ice.infomaniak.ch/upop-128.aac',
    thumbnailUrl: 'https://my-app.com/images/upop-thumb.png',
    color: '#E91E63',
  },
  {
    stationId: 'URADIO',
    name: 'URADIO',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover',
    customStreamUrl: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac',
    thumbnailUrl: 'https://my-app.com/images/uradio-thumb.png',
    color: '#2ECC71',
  },
  {
    stationId: 'URBAN',
    name: 'URBAN',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover',
    customStreamUrl: 'https://urban.ice.infomaniak.ch/urban-128.aac',
    thumbnailUrl: 'https://my-app.com/images/urban-thumb.png',
    color: '#F1C40F',
  },
];

const songOverrides = [
    {
        songKey: 'queen_another_one_bites_the_dust',
        artist: 'Queen',
        title: 'Another One Bites The Dust',
        customCoverUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Queen_The_Game.png'
    }
];

const importData = async () => {
  try {
    console.log('--- Data Import Started ---');
    console.log('1. Clearing existing data...');
    await Station.deleteMany();
    await SongCoverOverride.deleteMany();
    console.log('✅ Data cleared.');

    console.log('2. Inserting base station and override data...');
    const stationDocs = stations.map(s => ({ ...s, nowPlaying: [] }));
    await Station.insertMany(stationDocs);
    await SongCoverOverride.insertMany(songOverrides);
    console.log('✅ Base data inserted successfully.');

    console.log('3. Fetching initial live metadata for each station...');
    const allStations = await Station.find();

    for (const station of allStations) {
      try {
        // Fetch data with a timeout to prevent hanging
        const res = await axios.get(station.infomaniakUrl, { timeout: 5000 });
        
        // --- START: CORRECTED LOGIC ---

        // 1. Get the song history array from the `data` key in the response.
        const songHistory = res.data?.data;

        // 2. Find the first *valid* song. This filters out jingles or ads
        //    that have empty or placeholder titles.
        const currentSong = songHistory?.find(song => 
            song.title && song.title.trim().length > 1 && song.title.trim() !== '-'
        );

        // 3. If a valid current song was found, update the database.
        if (currentSong) {
          await Station.updateOne(
            { _id: station._id },
            // Store the single song object in an array to match schema
            { $set: { nowPlaying: [currentSong] } } 
          );
          console.log(`  -> Fetched metadata for ${station.name}`);
        } else {
          // If no valid song is found in the history, log it. The DB entry will remain empty.
          console.warn(`  -> ⚠️ No valid song found in history for ${station.name}.`);
        }
        // --- END: CORRECTED LOGIC ---

      } catch (metaErr) {
        // This catches network errors (timeout, no connection, etc.)
        console.error(`  -> ❌ ERROR fetching for ${station.name}: ${metaErr.message}`);
      }
    }

    console.log('\n--- ✅ Data Import Process Finished! ---');
    process.exit();
  } catch (error) {
    console.error(`\n--- ❌ FATAL ERROR during import: ${error.message} ---`);
    process.exit(1);
  }
};

// Run the script
importData();