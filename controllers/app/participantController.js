const GameParticipant = require('../../models/mongo/GameParticipant');

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
