const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

// Initialize database tables
async function initDatabase() {
  try {
    // Create pastes table
    await sql`
      CREATE TABLE IF NOT EXISTS pastes (
        id VARCHAR(21) PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE,
        max_views INTEGER,
        view_count INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT true
      )
    `;

    // Create index for expiration queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at)
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Create a new paste
async function createPaste(content, expiresIn = null, maxViews = null) {
  const id = require('nanoid').nanoid(21);
  
  let expiresAt = null;
  if (expiresIn) {
    const expirationMap = {
      '1h': 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    const ms = expirationMap[expiresIn] || parseInt(expiresIn) * 60 * 1000;
    expiresAt = new Date(Date.now() + ms);
  }

  const result = await sql`
    INSERT INTO pastes (id, content, expires_at, max_views)
    VALUES (${id}, ${content}, ${expiresAt}, ${maxViews})
    RETURNING id, created_at, expires_at, max_views, view_count
  `;

  return result[0];
}

// Get paste by ID
async function getPaste(id) {
  const result = await sql`
    SELECT * FROM pastes 
    WHERE id = ${id}
    AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
    AND (max_views IS NULL OR view_count < max_views)
  `;

  if (result.length === 0) return null;

  const paste = result[0];
  
  // Increment view count
  await sql`
    UPDATE pastes 
    SET view_count = view_count + 1 
    WHERE id = ${id}
  `;

  return paste;
}

// Delete expired pastes (can be run as a cron job)
async function deleteExpiredPastes() {
  const result = await sql`
    DELETE FROM pastes 
    WHERE expires_at IS NOT NULL 
    AND expires_at <= CURRENT_TIMESTAMP
    RETURNING id
  `;
  return result;
}

module.exports = {
  initDatabase,
  createPaste,
  getPaste,
  deleteExpiredPastes
};