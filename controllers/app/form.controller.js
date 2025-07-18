const FormSubmission = require('../../models/mongo/FormSubmission');





exports.submitForm = async (req, res) => {
  try {
    const { name, email, contactNo, city } = req.body;

    // Check req.file (singular), which is populated by .single()
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    // The CloudinaryStorage middleware has already uploaded the file.
    // The final URL is in req.file.path.
    const audioUrl = req.file.path;

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
    console.error("❌ Error submitting form:", err);
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

