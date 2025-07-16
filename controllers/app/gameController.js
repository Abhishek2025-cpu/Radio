const Game = require('../../models/mongo/Game');

exports.addGame = async (req, res) => {
  try {
    const image = req.file?.path;
    const { title, description } = req.body;

    if (!title || !description || !image)
      return res.status(400).json({ message: 'All fields are required' });

    const game = await Game.create({ title, description, image });
    res.status(201).json({ success: true, game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllGames = async (req, res) => {
  try {
    const games = await Game.find().sort({ createdAt: -1 });
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.toggleGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findById(id);
    if (!game) return res.status(404).json({ message: 'Game not found' });

    game.isActive = !game.isActive;
    await game.save();

    res.json({ success: true, game });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
