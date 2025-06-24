const cron = require('node-cron');
const Artist = require('../models/mongo/Artist');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const artists = await Artist.find();
    for (const artist of artists) {
      artist.votes = 0;
      artist.votedIPs = [];
      await artist.save();
    }
    console.log('Daily vote reset completed.');
  } catch (err) {
    console.error('Failed to reset votes:', err.message);
  }
});
