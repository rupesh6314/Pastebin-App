const express = require('express');
const router = express.Router();
const path = require('path');
const { getPaste } = require('../db/schema');

// View paste by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const paste = await getPaste(id);
    
    if (!paste) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Paste Not Found</title>
          <link rel="stylesheet" href="/style.css">
        </head>
        <body>
          <div class="container">
            <h1>❌ Paste Not Found</h1>
            <p>The paste you're looking for has expired or doesn't exist.</p>
            <a href="/" class="button">Create New Paste</a>
          </div>
        </body>
        </html>
      `);
    }

    // Send the view page with paste content
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Paste - ${paste.id}</title>
        <link rel="stylesheet" href="/style.css">
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Paste</h1>
            <div class="metadata">
              <span>ID: ${paste.id}</span>
              <span>Views: ${paste.view_count}${paste.max_views ? `/${paste.max_views}` : ''}</span>
              ${paste.expires_at ? `<span>Expires: ${new Date(paste.expires_at).toLocaleString()}</span>` : ''}
            </div>
          </div>
          <div class="content">
            <pre>${escapeHtml(paste.content)}</pre>
          </div>
          <div class="actions">
            <a href="/" class="button">New Paste</a>
            <button onclick="copyContent()" class="button">Copy</button>
          </div>
        </div>
        <script>
          function copyContent() {
            const content = ${JSON.stringify(paste.content)};
            navigator.clipboard.writeText(content).then(() => {
              alert('Copied to clipboard!');
            });
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error viewing paste:', error);
    res.status(500).send('Internal server error');
  }
});

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = router;