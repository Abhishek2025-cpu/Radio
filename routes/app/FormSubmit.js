const express = require('express');
const router = express.Router();
const multer = require('multer');
const formController = require('../../controllers/app/form.controller');

// const storage = multer.diskStorage({
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
// });
const { uploadStation } = require('../../middlewares/upload');

router.post(
  '/submit-form',
  uploadStation.single('audio'),
  formController.submitForm
);

router.get('/get-forms', formController.getForms);

module.exports = router;