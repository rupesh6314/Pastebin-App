const { deleteExpiredPastes } = require('./db/schema');

async function cleanup() {
  try {
    const deleted = await deleteExpiredPastes();
    console.log(`Cleaned up ${deleted.length} expired pastes`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

if (require.main === module) {
  cleanup();
}