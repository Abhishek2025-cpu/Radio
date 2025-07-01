require('dotenv').config();
const connectDB = require('./config/db.mongo');
const Station = require('./models/mongo/Station');
const SongCoverOverride = require('./models/mongo/SongCoverOverride');

// Connect to DB
connectDB();

const stations = [
  // --- Existing Stations ---
  {
    stationId: 'U80',
    name: 'U80',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
    customStreamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac',
    thumbnailUrl: 'https://my-app.com/images/u80-thumb.png',
    color: '#E67E22', // Orange
  },
  {
    stationId: 'U90',
    name: 'U90',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8221/metadata-all-cover',
    customStreamUrl: 'https://u90.ice.infomaniak.ch/u90-128.aac',
    thumbnailUrl: 'https://my-app.com/images/u90-thumb.png',
    color: '#3498DB', // Blue
  },
  // --- New Stations to Add ---
  {
    stationId: 'UDANCE',
    name: 'UDANCE',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8200/metadata-all-cover',
    customStreamUrl: 'https://udance.ice.infomaniak.ch/udance-128.aac',
    thumbnailUrl: 'https://my-app.com/images/udance-thumb.png',
    color: '#9B59B6', // Purple
  },
  {
    stationId: 'UPOP',
    name: 'UPOP',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8222/metadata-all-cover',
    customStreamUrl: 'https://upop.ice.infomaniak.ch/upop-128.aac',
    thumbnailUrl: 'https://my-app.com/images/upop-thumb.png',
    color: '#E91E63', // Pink
  },
  {
    stationId: 'URADIO',
    name: 'URADIO',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8113/metadata-all-cover',
    customStreamUrl: 'https://uradio-aac.ice.infomaniak.ch/uradio.aac',
    thumbnailUrl: 'https://my-app.com/images/uradio-thumb.png',
    color: '#2ECC71', // Green
  },
  {
    stationId: 'URBAN',
    name: 'URBAN',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8173/metadata-all-cover',
    // The key is now corrected to match the schema
    customStreamUrl: 'https://urban.ice.infomaniak.ch/urban-128.aac',
    thumbnailUrl: 'https://my-app.com/images/urban-thumb.png',
    color: '#F1C40F', // Yellow
  },
];

const songOverrides = [
    {
        songKey: 'queen_another_one_bites_the_dust',
        artist: 'Queen',
        title: 'Another One Bites The Dust',
        customCoverUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f5/Queen_The_Game.png'
    }
]

const importData = async () => {
  try {
    // Clear existing data
    await Station.deleteMany();
    await SongCoverOverride.deleteMany();

    // Insert new data
    await Station.insertMany(stations);
    await SongCoverOverride.insertMany(songOverrides);

    console.log('✅ Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error importing data: ${error}`);
    process.exit(1);
  }
};

// To run this script: node seed.js
importData();