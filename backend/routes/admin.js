const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { adminAuthMiddleware } = require('../middleware/adminAuth');
const { processAndEmbedFile } = require('../services/ingestionService');

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'data/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Allow only text-based files
  if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    // Reject file with a specific error message
    cb(new Error('Invalid file type. Only .txt, .md, and .pdf files are allowed.'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });
const uploadMiddleware = upload.single('document');


// Define the upload route with proper error handling
router.post('/upload', adminAuthMiddleware, (req, res) => {
    uploadMiddleware(req, res, async function (err) {
        // Handle file filter errors
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        
        // Handle case where no file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        // If all is well, proceed to process the file
        try {
            await processAndEmbedFile(req.file.path, req.file.filename);
            res.status(200).json({ message: 'File uploaded and processed successfully.' });
        } catch (processingError) {
            console.error('File processing error:', processingError);
            res.status(500).json({ error: 'Failed to process file.' });
        }
    });

});

router.get('/documents', adminAuthMiddleware, (req, res) => {
  const directoryPath = path.join(__dirname, '../data');

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error("Unable to scan directory: " + err);
      return res.status(500).json({ error: "Unable to scan documents." });
    }
    res.json(files);
  });
});


module.exports = router;