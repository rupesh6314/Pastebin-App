const express = require('express');
const router = express.Router();
const { createPaste } = require('../db/schema');

// Create a new paste
router.post('/', async (req, res) => {
  try {
    const { content, expiresIn, maxViews } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 1000000) { // 1MB limit
      return res.status(400).json({ error: 'Content too large (max 1MB)' });
    }

    const paste = await createPaste(content, expiresIn, maxViews);
    
    const shareableLink = `${process.env.BASE_URL || 'http://localhost:3000'}/${paste.id}`;
    
    res.status(201).json({
      id: paste.id,
      link: shareableLink,
      expires_at: paste.expires_at,
      max_views: paste.max_views,
      view_count: paste.view_count
    });
  } catch (error) {
    console.error('Error creating paste:', error);
    res.status(500).json({ error: 'Failed to create paste' });
  }
});

module.exports = router;