require('dotenv').config();
const connectDB = require('./config/db.mongo');
const Station = require('./models/mongo/Station');
const SongCoverOverride = require('./models/mongo/SongCoverOverride');

// Connect to DB
connectDB();

const stations = [
  {
    stationId: 'U80',
    name: 'U80',
    infomaniakUrl: 'https://metadata.infomaniak.com/api/radio/8220/metadata-all-cover',
    // Your custom values
    customStreamUrl: 'https://u80.ice.infomaniak.ch/u80-128.aac', // You can change this
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
  // Add the rest of your stations here...
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