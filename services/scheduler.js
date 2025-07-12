const cron = require('node-cron');
const Website = require('../models/Website');
const Voter = require('../models/Voter'); // We might not need this if TTL index works perfectly, but good for a manual reset.

/**
 * This function resets all website vote counts to 0.
 * It also clears the Voter collection, though the TTL index should handle this automatically.
 * This is meant to be run by a scheduler once every 24 hours.
 */
const resetDailyVotes = async () => {
  try {
    console.log('Running daily vote reset job...');

    // ✅ Reset all website vote counts to 0
    const updateResult = await Website.updateMany({}, { $set: { votes: 0 } });
    console.log(`Vote counts reset for ${updateResult.nModified} websites.`);

    // ✅ Manually clear the Voter collection as a fallback.
    // The 'expires' TTL index on the Voter model should already be doing this.
    // This ensures a clean slate every day regardless.
    const deleteResult = await Voter.deleteMany({});
    console.log(`Cleared ${deleteResult.deletedCount} voter records.`);

    console.log('Daily vote reset job finished successfully.');
  } catch (error) {
    console.error('Error during daily vote reset job:', error);
  }
};

// Schedule the job to run every day at midnight.
// Syntax: (seconds min hours day-of-month month day-of-week)
cron.schedule('0 0 * * *', resetDailyVotes, {
  scheduled: true,
  timezone: "America/New_York" // Set to your server's timezone
});

console.log('Daily vote reset scheduler has been started.');

// You can export the function if you want to trigger it manually for testing
module.exports = { resetDailyVotes };