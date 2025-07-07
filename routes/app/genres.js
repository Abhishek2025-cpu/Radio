const express = require('express');
const router = express.Router();
const Genre = require('../../models/mongo/genre');

// POST /api/genres - Create a new Genre
router.post('/create-genre', async (req, res) => {
    // In a real app, you'd handle image uploads here (e.g., to S3/Cloudinary)
    // and save the URL. For now, we assume the URL is in the body.
    const { name, description, imageUrl } = req.body;
    try {
        const newGenre = new Genre({ name, description, imageUrl });
        await newGenre.save();
        res.status(201).json(newGenre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/genres - Get all Genres
router.get('/all-genres', async (req, res) => {
    try {
        const genres = await Genre.find();
        res.json(genres);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/genres/:id/shows - Get all shows for a specific genre
router.get('genre/:id/shows', async (req, res) => {
    try {
        const shows = await Show.find({ genre: req.params.id });
        res.json(shows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/genres/:id - Update a Genre (e.g., change its image)
router.put('update-genre/:id', async (req, res) => {
    try {
        const updatedGenre = await Genre.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedGenre);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;