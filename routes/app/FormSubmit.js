const express = require('express');
const router = express.Router();
const multer = require('multer');
const formController = require('../../controllers/app/form.controller');

const storage = multer.diskStorage({
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post(
  '/submit-form',
  upload.single('audio'),
  formController.submitForm
);

module.exports = router;