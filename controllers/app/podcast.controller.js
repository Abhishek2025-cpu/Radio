

// controllers/podcast.controller.js

const Podcast = require('../../models/mongo/podcast.model');
const Genre = require('../../models/mongo/Genre');
const cloudinary = require('../../utils/cloudinary');

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
    const podcasts = await Podcast.find().select('genre').lean();
    const podcastGenres = podcasts.map(p => p.genre).filter(Boolean);

    const savedGenres = await Genre.find().select('_id name image status').lean();
    const savedGenreMap = new Map();

    savedGenres.forEach(g => {
      savedGenreMap.set(g.name.toLowerCase(), g);
    });

    const allGenreNames = [...new Set([...podcastGenres, ...savedGenres.map(g => g.name)])];

    const newGenresToInsert = [];

    const mergedGenres = allGenreNames.map(name => {
      const genreKey = name.toLowerCase();
      const found = savedGenreMap.get(genreKey);

      if (found) {
        return {
          _id: found._id,
          name: found.name,
          image: found.image || { url: null, public_id: null },
          status: found.status || "enabled",
        };
      } else {
        // Queue for insertion into DB
        newGenresToInsert.push({ name, image: { url: null, public_id: null }, status: "enabled" });
        return null; // Will be replaced after inserting
      }
    }).filter(Boolean);

    if (newGenresToInsert.length > 0) {
      const createdGenres = await Genre.insertMany(newGenresToInsert);

      createdGenres.forEach(g => {
        mergedGenres.push({
          _id: g._id,
          name: g.name,
          image: g.image,
          status: g.status,
        });
      });
    }

    res.status(200).json({
      count: mergedGenres.length,
      genres: mergedGenres,
    });

  } catch (error) {
    console.error('Error fetching unique genres:', error);
    res.status(500).json({ message: 'Error fetching unique genres', error: error.message });
  }
};






exports.getSubgenresByGenreName = async (req, res) => {
  try {
    const { genreName } = req.params;

    if (!genreName) {
      return res.status(400).json({ message: "Genre name is required." });
    }

    const subgenres = await Podcast.find({ genre: genreName, subgenre: { $exists: true, $ne: "" } })
      .select("subgenre")
      .lean();

    const uniqueSubgenres = [...new Set(subgenres.map(item => item.subgenre).filter(Boolean))];

    if (uniqueSubgenres.length === 0) {
      return res.status(404).json({ message: "No subgenres found for this genre." });
    }

    res.status(200).json({
      count: uniqueSubgenres.length,
      subgenres: uniqueSubgenres,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching subgenres", error: error.message });
  }
};



/**
 * @desc    Update a podcast
 * @route   PUT /api/podcasts/:id
 * @access  Private (Admin)
 */
// exports.updatePodcast = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find the podcast item to update
//     const podcast = await Podcast.findById(id);
//     if (!podcast) {
//       return res.status(404).json({ message: 'Podcast item not found' });
//     }

//     // Get text data from the request body
//     const { name, parent } = req.body;

//     // Update text fields if they were provided in the form-data
//     if (name) podcast.name = name;
//     if (parent) podcast.parent = parent; // Allows moving an item to a different parent

//     // Handle the image upload
//     // If a new image file was sent, our middleware provides its Cloudinary URL
//     if (req.file) {
//       podcast.image = req.file.path;
//     }

//     const updatedPodcast = await podcast.save();
//     res.status(200).json(updatedPodcast);

//   } catch (error) {
//     console.error('Error updating podcast:', error);
//     res.status(500).json({ message: 'Error updating podcast', error: error.message });
//   }
// };

/**
 * @desc    Toggle a podcast's active status (on/off)
 * @route   PATCH /api/podcasts/:id/status
 * @access  Private (Admin)
 */
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

/**
 * @desc    Get a specific podcast and its children by its full URL path
 * @route   GET /api/podcasts/by-path/*
 * @access  Public
 */
exports.getPodcastByPath = async (req, res) => {
  try {
    // req.params[0] captures everything after '/by-path/'
    const fullPath = req.params[0];

    if (!fullPath) {
      return res.status(400).json({ message: 'Path is required.' });
    }

    // Decode URI components like '%20' and split into segments
    const pathSegments = decodeURIComponent(fullPath).split('/').filter(Boolean);
    const slugSegments = pathSegments.map(segment => slugify(segment, { lower: true, strict: true }));

    let parentId = null;
    let targetPodcast = null;

    // Sequentially traverse the path to find the target podcast
    for (const slug of slugSegments) {
      const currentPodcast = await Podcast.findOne({ slug: slug, parent: parentId }).lean();

      if (!currentPodcast) {
        return res.status(404).json({ message: `Path not found at segment: '${slug}'` });
      }

      parentId = currentPodcast._id;
      targetPodcast = currentPodcast;
    }
    
    if (!targetPodcast) {
         // This case handles an empty path request, e.g., /api/podcasts/by-path/
         // Let's return all top-level podcasts
         const topLevelPodcasts = await Podcast.find({ parent: null }).lean();
         return res.status(200).json({
             podcast: { name: "Root", slug: "" },
             children: topLevelPodcasts
         });
    }

    // Now, find all direct children of the target podcast
    const children = await Podcast.find({ parent: targetPodcast._id }).lean();

    res.status(200).json({
      podcast: targetPodcast,
      children: children,
    });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching podcast by path', error: error.message });
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