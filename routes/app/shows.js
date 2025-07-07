const express = require('express');
const router = express.Router();
const Show = require('../../models/mongo/show');
const Episode = require('../../models/mongo/episode');

// POST /api/shows - Add a new show inside a genre
// This fulfills your request: "update genre by using its id to add more shows"
router.post('/add-show', async (req, res) => {
    const { name, description, genreId, ftpPath } = req.body;
    try {
        const newShow = new Show({ 
            name, 
            description, 
            genre: genreId, 
            ftpPath 
        });
        await newShow.save();
        res.status(201).json(newShow);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/shows/:id/episodes - Get episodes for a show with pagination
router.get('/show/:id/episodes', async (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20;
    try {
        const episodes = await Episode.find({ show: req.params.id })
            .sort({ publishedAt: -1 }) // Newest first
            .skip(page * size)
            .limit(size);
        res.json(episodes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;