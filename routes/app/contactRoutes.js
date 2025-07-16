const router = require('express').Router();
const contactCtrl = require('../../controllers/app/contactController');

router.post('/add-contact', contactCtrl.addContact);
router.get('/get-contact', contactCtrl.getContacts);

module.exports = router;
