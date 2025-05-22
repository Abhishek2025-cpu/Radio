const FormSubmission = require('../../models/mongo/FormSubmission');
const cloudinary = require('../../utils/cloudinary'); // adjust path if needed

exports.submitForm = async (req, res) => {
  try {
    const { name, email, contactNo, city } = req.body;
    let audioUrl = null;

    // Upload audio file to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video', // Cloudinary uses 'video' for audio files
        folder: 'form-audios'
      });
      audioUrl = result.secure_url;
    } else {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    const submission = new FormSubmission({
      name,
      email,
      contactNo,
      city,
      audioUrl
    });

    const saved = await submission.save();
    res.status(201).json({ message: 'Form submitted successfully', data: saved });
  } catch (err) {
    res.status(400).json({ error: `❌ ${err.message}` });
  }
};