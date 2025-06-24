const Artist = require('../../models/mongo/Artist');
const cloudinary = require('../../config/cloudinary');

exports.createArtist = async (req, res) => {
  try {
    const { name, songName } = req.body;

    let imageUrl = '';
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        { folder: 'artists/profiles' },
        (error, result) => {
          if (error) throw error;
          imageUrl = result.secure_url;
          saveArtist();
        }
      );
      result.end(req.file.buffer);
    } else {
      saveArtist();
    }

    async function saveArtist() {
      const artist = await Artist.create({
        name,
        songName,
        profileImage: imageUrl,
      });
      res.status(201).json(artist);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
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
