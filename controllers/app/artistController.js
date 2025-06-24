const Artist = require('../../models/mongo/Artist');
const cloudinary = require('../../config/cloudinary');


// Utility: Stream upload to Cloudinary
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'artists/profiles' },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

exports.createArtist = async (req, res) => {
  try {
    const { name, songName } = req.body;
    let imageUrl = null;

    console.log('Incoming request:', {
      name,
      songName,
      fileExists: !!req.file,
    });

    if (!name || !songName) {
      return res.status(400).json({ error: 'name and songName are required' });
    }

    if (req.file) {
      try {
        const result = await streamUpload(req.file.buffer);
        console.log('Cloudinary upload result:', result);
        imageUrl = result.secure_url;
      } catch (uploadErr) {
        console.error('Cloudinary upload failed:', uploadErr);
        return res.status(500).json({ error: 'Image upload failed' });
      }
    }

    const artist = new Artist({
      name,
      songName,
      profileImage: imageUrl,
      votes: 0,
      votedIPs: [],
    });

    await artist.save();

    res.status(201).json(artist);
  } catch (err) {
    console.error('Create artist error:', err);
    res.status(500).json({ error: 'Internal server error'});
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
    await Artist.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vote (IP-based)
exports.voteArtist = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });

    if (artist.votedIPs.includes(ip)) {
      return res.status(403).json({ message: 'You have already voted' });
    }

    artist.votes += 1;
    artist.votedIPs.push(ip);

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

