const router = require('express').Router();
const contactCtrl = require('../../controllers/app/contactController');

router.post('/add-contact', contactCtrl.addContact);
router.get('/get-contact', contactCtrl.getContacts);
router.delete('/delete-contact/:id', contactCtrl.deleteContact);
router.post('/delete-multiple', contactCtrl.deleteMultipleContacts);

module.exports = router;
