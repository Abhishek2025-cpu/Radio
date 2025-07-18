const express = require('express');
const router = express.Router();

const formController = require('../../controllers/app/form.controller');

// const storage = multer.diskStorage({
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// });
const { uploadAudio } = require('../../middlewares/upload');

router.post(
  '/submit-form',
 uploadAudio.single('audio')
,
  formController.submitForm
);


router.get('/get-forms', formController.getForms);
router.delete('/delete/:id', formController.deleteForm);

module.exports = router;