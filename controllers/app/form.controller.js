const FormSubmission = require('../../models/mongo/FormSubmission');





exports.submitForm = async (req, res) => {
  try {
    const { name, email, contactNo, city } = req.body;
    
    // 1. Check req.file (singular), not req.files.
    // If no file was uploaded, the middleware would have already handled it,
    // but this is a good safety check.
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required.' });
    }

    // 2. The middleware has already uploaded the file.
    // The final Cloudinary URL is in req.file.path.
    const audioUrl = req.file.path;

    // 3. Create and save the new submission.
    const submission = new FormSubmission({
      name,
      email,
      contactNo,
      city,
      audioUrl, // Use the URL directly from the middleware
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

