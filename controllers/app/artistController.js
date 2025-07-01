const Artist = require('../../models/mongo/Artist');
const { uploadToCloudinary } = require('../../utils/cloudinary');
const fs = require('fs').promises;


const ipaddr = require('ipaddr.js');
const bcrypt = require('bcryptjs');



// ... other require statements

exports.createArtist = async (req, res) => {
  // Keep track of file paths for cleanup
  const filePaths = [];

  try {
    const { name, songName } = req.body;
    const artistData = { name, songName };

    // Upload profileImage using path
    if (req.files?.profileImage?.[0]) {
      const profileImageFile = req.files.profileImage[0];
      filePaths.push(profileImageFile.path); // Add path for cleanup
      const uploadedImage = await uploadToCloudinary(
        profileImageFile.path,
        profileImageFile.mimetype,
        true // use path
      );
      artistData.profileImage = uploadedImage.secure_url;
    }

    // Upload media using path
    if (req.files?.media?.[0]) {
      const mediaFile = req.files.media[0];
      filePaths.push(mediaFile.path); // Add path for cleanup

      // **** THIS IS THE FIX ****
      // Use the path and set usePath to true
      const uploadedMedia = await uploadToCloudinary(
        mediaFile.path,
        mediaFile.mimetype,
        true // use path
      );
      artistData.mediaUrl = uploadedMedia.secure_url;
    }

    const newArtist = await Artist.create(artistData);
    return res.status(201).json(newArtist);
  } catch (err) {
    console.error('Create artist error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    // **BEST PRACTICE**: Clean up the temporary files from the 'uploads' folder
    // This block runs whether the try succeeds or fails
    for (const path of filePaths) {
      try {
        await fs.unlink(path);
      } catch (cleanupErr) {
        console.error('Error cleaning up temporary file:', path, cleanupErr);
      }
    }
  }
};





exports.updateArtist = async (req, res) => {
  const { id } = req.params;
  const filePaths = [];

  try {
    const { name, songName } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (songName) updateData.songName = songName;

    console.log('Files received:', req.files);

    if (req.files?.profileImage?.[0]) {
      const profileImageFile = req.files.profileImage[0];
      filePaths.push(profileImageFile.path);

      const uploadedImage = await uploadToCloudinary(
        profileImageFile.path,
        profileImageFile.mimetype,
        true
      );
      updateData.profileImage = uploadedImage.secure_url;
    }

    if (req.files?.media?.[0]) {
      const mediaFile = req.files.media[0];
      filePaths.push(mediaFile.path);

      const uploadedMedia = await uploadToCloudinary(
        mediaFile.path,
        mediaFile.mimetype,
        true
      );
      updateData.mediaUrl = uploadedMedia.secure_url;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
    }

    const updatedArtist = await Artist.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedArtist) {
      return res.status(404).json({ error: 'Artist not found.' });
    }

    return res.status(200).json(updatedArtist);
  }  catch (err) {
  console.error('Error caught in updateArtist:', err);

  // Force serialization of hidden properties like message and stack
  const serializedErr = {
    message: err?.message || 'No message',
    stack: err?.stack || 'No stack',
    name: err?.name || 'No name',
    ...(err?.response?.data && { cloudinaryResponse: err.response.data }),
  };

  console.error('Serialized error:', serializedErr);

  return res.status(500).json({
    error: 'Internal server error',
    err: serializedErr
  });
}
 finally {
    for (const path of filePaths) {
      try {
        await fs.unlink(path);
      } catch (cleanupErr) {
        console.error('Error cleaning up temporary file:', path, cleanupErr);
      }
    }
  }
};


// Read
exports.getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find().sort({ votes: -1 }); // dynamic positioning
    res.status(200).json(artists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.status(200).json(artist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Delete
exports.deleteArtist = async (req, res) => {
  try {
    const deletedArtist = await Artist.findByIdAndDelete(req.params.id);

    if (!deletedArtist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.status(200).json({
      message: "Artist deleted successfully",
      artist: deletedArtist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.voteArtist = async (req, res) => {
  try {
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress;
    const ip = rawIp.replace('::ffff:', '');

    if (!ipaddr.isValid(ip)) {
      return res.status(400).json({ message: 'Invalid IP address' });
    }

    const parsedIp = ipaddr.parse(ip);
    if (!parsedIp.range() || !['private', 'linkLocal', 'loopback'].includes(parsedIp.range())) {
      return res.status(403).json({ message: 'Only private or local IPs are allowed' });
    }

    const now = new Date();

    // ✅ Step 1: Fetch all artists
    const allArtists = await Artist.find({});

    // ✅ Step 2: Check if this IP has voted for any artist in last 24 hrs
    for (const a of allArtists) {
      // Clean up expired votes
      a.votedIPs = a.votedIPs.filter(entry => now - new Date(entry.votedAt) < 24 * 60 * 60 * 1000);

      // Check hashed IP against this artist
      const matched = await Promise.all(
        a.votedIPs.map(entry => bcrypt.compare(ip, entry.ipHash))
      );

      if (matched.includes(true)) {
        return res.status(403).json({ message: 'You have already voted for another artist in the last 24 hours' });
      }
    }

    // ✅ Step 3: Proceed with vote for this artist
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    const ipHash = await bcrypt.hash(ip, 10);

    artist.votes += 1;
    artist.votedIPs.push({ ipHash, votedAt: now });

    await artist.save();
    res.status(200).json({ message: 'Vote registered', votes: artist.votes });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// controllers/app/artistController.js
exports.partialUpdateArtist = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive === 'undefined') {
      return res.status(400).json({ message: 'isActive is required' });
    }

    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    res.status(200).json({ message: 'Artist status updated', artist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

