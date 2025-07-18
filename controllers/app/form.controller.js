const FormSubmission = require('../../models/mongo/FormSubmission');
const { cloudinary } = require('../../utils/cloudinary');


exports.submitForm = async (req, res) => {
  try {
    const { name, email, contactNo, city } = req.body;
    let audioUrl = null;

    if (req.files && req.files.length > 0) {
      const file = req.files[0]; // Taking the first file from array
      const result = await cloudinary.uploader.upload(file.path, {
        resource_type: 'video',
        folder: 'form-audios',
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
      audioUrl,
    });

    const saved = await submission.save();
    res.status(201).json({ message: 'Form submitted successfully', data: saved });
  } catch (err) {
    res.status(400).json({ error: `❌ ${err.message}` });
  }
};



exports.getForms = async (req, res) => {
  try {
    const submissions = await FormSubmission.find().sort({ createdAt: -1 });
    res.status(200).json({ data: submissions });
  } catch (err) {
    res.status(500).json({ error: `❌ ${err.message}` });
  }
};
//yo yo

exports.deleteForm = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedForm = await FormSubmission.findByIdAndDelete(id);

    if (!deletedForm) {
      return res.status(404).json({ success: false, message: "Form submission not found" });
    }

    res.json({ success: true, message: "Form submission deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

