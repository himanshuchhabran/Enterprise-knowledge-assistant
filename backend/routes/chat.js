const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { handleQuery } = require('../services/ragService');

router.post('/', authMiddleware, async (req, res) => {
  const { query } = req.body;
  const userId = req.user.id;

  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  try {
    const answer = await handleQuery(query, userId);
    res.json({ answer });
  } catch (error) {
    console.error('Error in chat route:', error);
    res.status(500).json({ error: 'Failed to process your request.' });
  }
});

module.exports = router;