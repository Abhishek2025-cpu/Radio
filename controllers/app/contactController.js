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

// Delete contact by _id
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ success: false, message: "Contact not found" });
    }

    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};


// Delete multiple contacts by array of _id
exports.deleteMultipleContacts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "Please provide an array of contact IDs" });
    }

    const result = await Contact.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} contact(s) deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
