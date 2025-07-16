

// controllers/podcast.controller.js

const Podcast = require('../../models/mongo/podcast.model');
const Genre = require('../../models/mongo/Genre');
const cloudinary = require('../../utils/cloudinary');
const GenreShow = require("../../models/mongo/GenreShow");
const GenreShowOverride = require("../../models/mongo/GenreShowOverride");

/**
 * @desc    Create a new podcast category/show
 * @route   POST /api/podcasts
 * @access  Private (Admin)
 */

exports.addGenre = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Genre name is required.' });
    }

    // Case-insensitive check for existing genre
    const existingGenre = await Genre.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
    });

    if (existingGenre) {
      return res.status(409).json({ message: 'Genre with this name already exists.' });
    }

    // Prepare the data for the new genre
    const genreData = { name };

    // Handle uploaded image via multer-storage-cloudinary
    if (req.file) {
      genreData.image = {
        url: req.file.path,        // Cloudinary URL from Multer-Cloudinary
        public_id: req.file.filename,  // Cloudinary public_id
      };
    }

    // Create the new genre
    const newGenre = await Genre.create(genreData);

    res.status(201).json({
      message: 'Genre added successfully',
      genre: newGenre,
    });

  } catch (error) {
    console.error('Error adding genre:', error);
    res.status(500).json({ message: 'Error adding genre', error: error.message });
  }
};



exports.updateGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const genre = await Genre.findById(id);

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found.' });
    }
    
    // Update name if provided
    if (name) {
      genre.name = name;
    }

    // Handle image update
    if (req.file) {
      // If there's an old image, delete it from Cloudinary
      if (genre.image && genre.image.public_id) {
        await cloudinary.uploader.destroy(genre.image.public_id);
      }
      
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'genres', // Optional: organize images in a folder
      });

      genre.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const updatedGenre = await genre.save();
    res.status(200).json({ message: 'Genre updated successfully', genre: updatedGenre });
  } catch (error) {
    res.status(500).json({ message: 'Error updating genre', error: error.message });
  }
};

// API 3: Toggle the status of a genre (enable/disable)
exports.toggleGenreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findById(id);

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found.' });
    }

    // Toggle status
    genre.status = genre.status === 'enabled' ? 'disabled' : 'enabled';
    await genre.save();

    res.status(200).json({ message: `Genre status changed to ${genre.status}`, genre });
  } catch (error) {
    res.status(500).json({ message: 'Error toggling genre status', error: error.message });
  }
};

// API 4: Delete a genre by ID
exports.deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    const genre = await Genre.findById(id);

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found.' });
    }

    // If an image exists in Cloudinary, delete it first
    if (genre.image && genre.image.public_id) {
      await cloudinary.uploader.destroy(genre.image.public_id);
    }

    await Genre.findByIdAndDelete(id);

    res.status(200).json({ message: 'Genre deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting genre', error: error.message });
  }
};

exports.getAdminGenres = async (req, res) => {
  try {
    // Fetch only from Genre collection — no merging from Podcast
    const genres = await Genre.find().select('_id name image status').lean();

    res.status(200).json({
      count: genres.length,
      genres: genres.map(g => ({
        _id: g._id,
        name: g.name,
        image: g.image || { url: null, public_id: null },
        status: g.status || 'enabled',
      })),
    });
  } catch (error) {
    console.error('Error fetching admin genres:', error);
    res.status(500).json({ message: 'Error fetching admin genres', error: error.message });
  }
};



exports.getPublicGenres = async (req, res) => {
  try {
    const genres = await Genre.find({ status: 'enabled' }).select('name image.url');
    res.status(200).json({
      count: genres.length,
      genres: genres,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public genres', error: error.message });
  }
};














exports.createPodcast = async (req, res) => {
  try {
    // parent can be null (for top-level) or an ID of an existing category
    const { name, parent, image, episodes } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Podcast name is required.' });
    }

    const podcast = await Podcast.create({ name, parent, image, episodes });
    res.status(201).json(podcast);
  } catch (error) {
    res.status(500).json({ message: 'Error creating podcast', error: error.message });
  }
};

/**
 * @desc    Get all podcasts as a nested tree structure
 * @route   GET /api/podcasts
 * @access  Public
 */
exports.getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find().lean(); // .lean() for faster read-only operations

    // Helper function to build the tree
    const buildTree = (list) => {
      const map = {};
      const roots = [];

      list.forEach((item, i) => {
        map[item._id] = i; // Use map to look up the index of each item
        item.children = []; // Initialize children array
      });

      list.forEach((item) => {
        if (item.parent) {
          // If it's a child, push it to its parent's children array
          if(list[map[item.parent]]) {
            list[map[item.parent]].children.push(item);
          }
        } else {
          // If it's a root node, push it to the roots array
          roots.push(item);
        }
      });
      return roots;
    };

    const podcastTree = buildTree(podcasts);

    res.status(200).json({
      count: podcasts.length,
      data: podcastTree,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching podcasts', error: error.message });
  }
};





exports.getUniqueGenres = async (req, res) => {
  try {
    // Fetch podcast genres
    const podcasts = await Podcast.find().select('genre').lean();
    const podcastGenres = podcasts.map(p => p.genre).filter(Boolean);

    // Fetch saved genres
    const savedGenres = await Genre.find().select('_id name image status').lean();
    const savedGenreMap = new Map(savedGenres.map(g => [g.name.toLowerCase(), g]));

    const newGenresToInsert = [];

    podcastGenres.forEach(name => {
      const genreKey = name.toLowerCase();
      if (!savedGenreMap.has(genreKey)) {
        newGenresToInsert.push({ name, image: { url: null, public_id: null }, status: "enabled" });
      }
    });

    // Insert new genres if any
    if (newGenresToInsert.length > 0) {
      await Genre.insertMany(newGenresToInsert);
    }

    // ✅ Always fetch fresh genres after insert or not
    const updatedGenres = await Genre.find().select('_id name image status').lean();

    res.status(200).json({
      count: updatedGenres.length,
      genres: updatedGenres.map(g => ({
        _id: g._id,
        name: g.name,
        image: g.image || { url: null, public_id: null },
        status: g.status || "enabled",
      })),
    });
  } catch (error) {
    console.error('Error fetching unique genres:', error);
    res.status(500).json({ message: 'Error fetching unique genres', error: error.message });
  }
};






const mongoose = require("mongoose");

exports.getSubgenresByGenreName = async (req, res) => {
  try {
    const { genreName } = req.params;
    if (!genreName) {
      return res.status(400).json({ message: "Genre name is required." });
    }

    // Podcast subgenres
    const podcastSubgenres = await Podcast.find({
      genre: genreName,
      subgenre: { $exists: true, $ne: "" },
    }).select("subgenre").lean();

    const uniquePodcastNames = [...new Set(podcastSubgenres.map(item => item.subgenre).filter(Boolean))];

    // Fetch overrides for these podcast subgenres
    const podcastIdentifiers = uniquePodcastNames.map(name => `podcast-${name}`);
    const overrides = await GenreShowOverride.find({
      subgenreId: { $in: podcastIdentifiers },
    }).lean();

    const overrideMap = {};
    overrides.forEach(override => {
      overrideMap[override.subgenreId] = override.visible;
    });

    const podcastSubgenreObjects = uniquePodcastNames.map(name => {
      const identifier = `podcast-${name}`;
      const visible = overrideMap.hasOwnProperty(identifier) ? overrideMap[identifier] : true;

      return visible ? {
        _id: new mongoose.Types.ObjectId(),
        name,
        image: { url: null, public_id: null },
        status: "enabled",
        source: "podcast",
      } : null;
    }).filter(Boolean);

    // Admin genre shows
    const genreShows = await GenreShow.find({
      genreName,
      visible: true,
    }).select("name image status").lean();

    const adminSubgenreObjects = genreShows.map(show => ({
      _id: show._id,
      name: show.name,
      image: show.image,
      status: show.status,
      source: "admin",
    }));

    const combinedSubgenres = [...podcastSubgenreObjects, ...adminSubgenreObjects];

    if (combinedSubgenres.length === 0) {
      return res.status(404).json({ message: "No subgenres found for this genre." });
    }

    res.status(200).json({
      count: combinedSubgenres.length,
      subgenres: combinedSubgenres,
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching subgenres", error: error.message });
  }
};








exports.getSubgenresByGenreNameAdmin = async (req, res) => {
  try {
    const { genreName } = req.params;
    if (!genreName) {
      return res.status(400).json({ message: "Genre name is required." });
    }

    const podcastSubgenres = await Podcast.find({
      genre: genreName,
      subgenre: { $exists: true, $ne: "" },
    }).select("subgenre").lean();

    const uniquePodcastNames = [...new Set(podcastSubgenres.map(item => item.subgenre).filter(Boolean))];

    const podcastSubgenreObjects = uniquePodcastNames.map(name => ({
      _id: new mongoose.Types.ObjectId(),
      name,
      image: { url: null, public_id: null },
      status: "enabled",
      source: "podcast",
    }));

    const genreShows = await GenreShow.find({
      genreName,
    }).select("name image status visible").lean();

    const adminSubgenreObjects = genreShows.map(show => ({
      _id: show._id,
      name: show.name,
      image: show.image,
      status: show.status,
      visible: show.visible,
      source: "admin",
    }));

    const combinedSubgenres = [...podcastSubgenreObjects, ...adminSubgenreObjects];

    res.status(200).json({
      count: combinedSubgenres.length,
      subgenres: combinedSubgenres,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subgenres (admin)", error: error.message });
  }
};







exports.togglePodcastStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean value.' });
    }

    const podcast = await Podcast.findByIdAndUpdate(id, { isActive }, { new: true });

    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    res.status(200).json({ message: `Podcast status updated to ${isActive}`, data: podcast });
  } catch (error) {
    res.status(500).json({ message: 'Error updating podcast status', error: error.message });
  }
};


/**
 * @desc    Delete a podcast
 * @route   DELETE /api/podcasts/:id
 * @access  Private (Admin)
 */
exports.deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    // IMPORTANT: Check if this category is a parent to any other category
    const child = await Podcast.findOne({ parent: id });
    if (child) {
      return res.status(400).json({
        message: 'Cannot delete podcast because it has children. Please delete its children first.',
      });
    }

    const podcast = await Podcast.findByIdAndDelete(id);

    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    res.status(200).json({ message: 'Podcast deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting podcast', error: error.message });
  }
};



// GET API for Public (shows only 'enabled' genres)
exports.getPublicGenres = async (req, res) => {
  try {
    const genres = await Genre.find({ status: 'enabled' }).select('name image.url');
    res.status(200).json({
      count: genres.length,
      genres: genres,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching public genres', error: error.message });
  }
};



///////////////////////////////////////////////////shows-section//////////////////////////////////////////////////////


exports.addShowToGenre = async (req, res) => {
  try {
    const { genreName } = req.params;
    const { name, visible } = req.body;

    if (!genreName || !name) {
      return res.status(400).json({ message: "Genre name and show name are required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const image = {
      url: req.file.path,
      public_id: req.file.filename,
    };

    const newShow = await GenreShow.create({
      genreName,
      name,
      image,
      visible: visible !== undefined ? visible === 'true' : true,
    });

    res.status(201).json({ message: "Show added successfully.", show: newShow });
  } catch (error) {
    res.status(500).json({ message: "Error adding show.", error: error.message });
  }
};


exports.getAllGenreShows = async (req, res) => {
  try {
    const { visible } = req.query;

    const filter = {};
    if (visible !== undefined) {
      filter.visible = visible === "true";
    }

    const shows = await GenreShow.find(filter).lean();
    res.status(200).json({ count: shows.length, shows });
  } catch (error) {
    res.status(500).json({ message: "Error fetching genre shows.", error: error.message });
  }
};

exports.toggleGenreShow = async (req, res) => {
  try {
    const { identifier } = req.params;
    const { status } = req.body;

    if (!identifier) {
      return res.status(400).json({ message: "Show ID is required." });
    }

    const visible = status === "true";

    if (identifier.startsWith("podcast-")) {
      let override = await GenreShowOverride.findOne({ subgenreId: identifier });

      if (!override) {
        override = new GenreShowOverride({
          subgenreId: identifier,
          visible,
        });
      } else {
        override.visible = visible;
      }

      await override.save();

      return res.status(200).json({
        message: "Podcast show status updated via override.",
        override,
      });
    } else {
      const genreShow = await GenreShow.findById(identifier);

      if (!genreShow) {
        return res.status(404).json({ message: "Genre show not found." });
      }

      genreShow.visible = visible;
      await genreShow.save();

      return res.status(200).json({
        message: "Admin show status updated successfully.",
        genreShow,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error toggling genre show status.",
      error: error.message,
    });
  }
};




exports.deleteGenreShow = async (req, res) => {
  try {
    const { identifier } = req.params;

    const deleted = await GenreShow.findOneAndDelete({
      $or: [{ name: identifier }, { "image.public_id": identifier }],
    });

    if (!deleted) {
      return res.status(404).json({ message: "Genre show not found." });
    }

    res.status(200).json({ message: "Genre show deleted successfully.", deleted });
  } catch (error) {
    res.status(500).json({ message: "Error deleting genre show.", error: error.message });
  }
};

exports.updateGenreShow = async (req, res) => {
  try {
    const { genreName, showId } = req.params;
    const { name } = req.body;

    const genreShow = await GenreShow.findOne({ _id: showId, genreName });
    if (!genreShow) {
      return res.status(404).json({ message: "Genre show not found." });
    }

    if (name) genreShow.name = name;

    // If a new image is uploaded:
    if (req.file) {
      // Delete old image from Cloudinary:
      if (genreShow.image?.public_id) {
        await cloudinary.uploader.destroy(genreShow.image.public_id);
      }

      genreShow.image = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    await genreShow.save();

    res.status(200).json({ message: "Genre show updated successfully.", genreShow });
  } catch (error) {
    res.status(500).json({ message: "Error updating genre show.", error: error.message });
  }
};