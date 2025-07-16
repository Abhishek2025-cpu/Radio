const Playback = require('../../models/mongo/ParticipantPlayback');

exports.addPlayback = async (req, res) => {
  try {
    const { game, participant, date, time } = req.body;

    if (!game || !participant || !date || !time)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const playback = await Playback.create({ game, participant, date, time });
    res.status(201).json({ success: true, playback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getPlaybackByGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const playbackList = await Playback.find({ game: gameId })
      .populate('participant', 'nom prenom media')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, playbackList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updatePlayback = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    const playback = await Playback.findByIdAndUpdate(id, { date, time }, { new: true });
    res.json({ success: true, playback });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePlayback = async (req, res) => {
  try {
    const { id } = req.params;
    await Playback.findByIdAndDelete(id);
    res.json({ success: true, message: 'Playback deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
