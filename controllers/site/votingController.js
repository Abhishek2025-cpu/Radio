const Website = require('../models/Website');
const Voter = require('../models/Voter');
const bcrypt = require('bcryptjs'); // Using bcrypt for hashing

/**
 * @desc    Register a vote for a specific website.
 * @route   POST /api/websites/:id/vote
 * @access  Public
 */
exports.voteForWebsite = async (req, res) => {
  try {
    const { name, city } = req.body;

    // ✅ Step 1: Validate input from the user
    if (!name || !city) {
      return res.status(400).json({ message: 'Name and city are required to vote.' });
    }

    // ✅ Step 2: Create a unique but anonymous identifier for the voter
    // We normalize the input to ensure "John" and "john" are treated the same.
    const voterIdentifier = `${name.toLowerCase().trim()}_${city.toLowerCase().trim()}`;

    // ✅ Step 3: Check if this identifier has already voted
    // We fetch all recent voters. Because of the 'expires' index on the Voter model,
    // this collection will only ever contain voters from the last 24 hours.
    const recentVoters = await Voter.find({});

    for (const voter of recentVoters) {
      // Compare the new identifier with the stored hash
      const hasVoted = await bcrypt.compare(voterIdentifier, voter.identifierHash);
      if (hasVoted) {
        return res.status(403).json({ message: 'You have already voted in the last 24 hours.' });
      }
    }

    // ✅ Step 4: Find the website to vote for
    const website = await Website.findById(req.params.id);
    if (!website) {
      return res.status(404).json({ message: 'Website not found.' });
    }

    // ✅ Step 5: Process the new vote
    // Hash the identifier before saving
    const identifierHash = await bcrypt.hash(voterIdentifier, 10);

    // Create a new voter record. It will self-destruct in 24 hours.
    const newVoter = new Voter({ identifierHash });

    // Increment the website's vote count
    website.votes += 1;

    // Save both changes to the database
    await Promise.all([newVoter.save(), website.save()]);

    res.status(200).json({
      message: 'Thank you for your vote!',
      websiteName: website.name,
      votes: website.votes,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while processing your vote.', error: err.message });
  }
};