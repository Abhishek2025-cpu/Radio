const Contact = require('../../models/mongo/Contact');

// Add new contact
exports.addContact = async (req, res) => {
  try {
    const { nom, prenom, ville, email, telephone, message } = req.body;
    
    if (!nom || !prenom || !ville || !email || !telephone || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const contact = await Contact.create({ nom, prenom, ville, email, telephone, message });
    res.status(201).json({ success: true, contact });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all contacts
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
