const GameParticipant = require('../../models/mongo/GameParticipant');
const ParticipationMsg = require('../../models/mongo/ParticipationMsg');
const GameBanner = require('../../models/mongo/GameBanner');


exports.submitParticipation = async (req, res) => {
  try {
    const { game, nom, prenom, dateNaissance, ville, email, telephone } = req.body;
    const media = req.file?.path;

    if (!game || !nom || !prenom || !dateNaissance || !ville || !email || !telephone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const participant = await GameParticipant.create({
      game, nom, prenom, dateNaissance, ville, email, telephone, media
    });

    res.status(201).json({ success: true, participant });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getParticipantsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const participants = await GameParticipant.find({ game: gameId }).sort({ createdAt: -1 });
    res.json({ success: true, participants });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};




exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;

    const participant = await GameParticipant.findById(id);
    if (!participant) {
      return res.status(404).json({ success: false, message: 'Participant not found' });
    }

    // Delete media file if exists
    if (participant.media) {
      const filePath = path.join(__dirname, '../../../', participant.media); // adjust path as needed
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete media file:', err);
      });
    }

    await GameParticipant.findByIdAndDelete(id);
    res.json({ success: true, message: 'Participant deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.submitParticipationMessage = async (req, res) => {
  try {
    const { name, email, city, game } = req.body;
    const audio = req.file?.path;

    if (!name || !email || !city || !audio || !game) {
      return res.status(400).json({ success: false, message: 'All fields are required including game' });
    }

    // Optional: validate game ID exists
    const gameExists = await GameBanner.findById(game);
    if (!gameExists) {
      return res.status(404).json({ success: false, message: 'Invalid game ID' });
    }

    const message = await ParticipationMsg.create({ name, email, city, audio, game });
    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


exports.getParticipationMessages = async (req, res) => {
  try {
    const messages = await ParticipationMsg.find()
      .sort({ createdAt: -1 })
      .populate('game', 'title'); // populate game title only

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



exports.deleteParticipationMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await ParticipationMsg.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await ParticipationMsg.findByIdAndDelete(id);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
