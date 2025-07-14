

// controllers/podcast.controller.js

const Podcast = require('../../models/mongo/podcast.model');

/**
 * @desc    Create a new podcast category/show
 * @route   POST /api/podcasts
 * @access  Private (Admin)
 */
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

/**
 * @desc    Update a podcast
 * @route   PUT /api/podcasts/:id
 * @access  Private (Admin)
 */
exports.updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent, image, episodes } = req.body;

    // Build the update object dynamically
    const updateData = {};
    if (name) updateData.name = name;
    if (parent !== undefined) updateData.parent = parent; // Allow setting parent to null
    if (image) updateData.image = image;
    if (episodes) updateData.episodes = episodes;

    const podcast = await Podcast.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true,
    });

    if (!podcast) {
      return res.status(404).json({ message: 'Podcast not found' });
    }

    res.status(200).json(podcast);
  } catch (error) {
    res.status(500).json({ message: 'Error updating podcast', error: error.message });
  }
};

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