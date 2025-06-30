const Artist = require('../../models/mongo/Artist');
const { uploadToCloudinary } = require('../../config/cloudinary');


const ipaddr = require('ipaddr.js');
const bcrypt = require('bcryptjs');







exports.uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ resource_type: 'auto' }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    const { Readable } = require('stream');
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(stream);
  });
};


exports.createArtist = async (req, res) => {
  try {
    const { name, songName } = req.body;

    if (!name || !songName) {
      return res.status(400).json({ error: 'name and songName are required' });
    }

    console.log('Incoming request:', {
      name,
      songName,
      files: req.files,
    });

    let imageUrl = null;
    let mediaUrl = null;

    // Upload profileImage
    if (req.files?.profileImage?.[0]) {
      const imageFile = req.files.profileImage[0];
      const imageUploadResult = await uploadToCloudinary(imageFile.buffer, imageFile.mimetype);
      imageUrl = imageUploadResult.secure_url;
    }

    // Upload media (mp3)
    if (req.files?.media?.[0]) {
      const mediaFile = req.files.media[0];
      const mediaUploadResult = await uploadToCloudinary(mediaFile.buffer, mediaFile.mimetype);
      mediaUrl = mediaUploadResult.secure_url;
    }

    const artist = new Artist({
      name,
      songName,
      profileImage: imageUrl,
      media: mediaUrl, // new field in schema
      votes: 0,
      votedIPs: [],
    });

    await artist.save();

    res.status(201).json(artist);
  }  catch (err) {
  console.error('Create artist error:', {
    message: err.message,
    stack: err.stack,
    full: err,
  });
  res.status(500).json({ error: 'Internal server error', err: err.message });
}

};




exports.updateArtist = async (req, res) => {
  try {
    const { name, songName } = req.body;

    const updateData = { name, songName };

    if (req.file) {
      const upload = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'artists/profiles' }, (err, result) => {
          if (err) return reject(err);
          resolve(result.secure_url);
        }).end(req.file.buffer);
      });

      updateData.profileImage = upload;
    }

    const updated = await Artist.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

