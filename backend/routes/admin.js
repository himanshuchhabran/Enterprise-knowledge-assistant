const express = require('express');
const multer = require('multer');
const path = require('path');
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const { processAndEmbedFile } = require('../services/ingestionService');

const router = express.Router();

// Configure multer to store files in the 'data' directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'data/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Define the upload route
router.post('/upload', adminAuthMiddleware, upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    // Process the newly uploaded file
    await processAndEmbedFile(req.file.path, req.file.filename);
    res.status(200).json({ message: 'File uploaded and processed successfully.' });
  } catch (error) {
    console.error('File processing error:', error);
    res.status(500).json({ error: 'Failed to process file.' });
  }
});

module.exports = router;