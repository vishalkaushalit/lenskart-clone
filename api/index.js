import app, { initializeApp } from '../backend/src/server.js';

export default async function handler(req, res) {
  try {
    await initializeApp();
    return app(req, res);
  } catch (error) {
    console.error('API initialization failed:', error.name);
    return res.status(503).json({ success: false, message: 'Service temporarily unavailable.' });
  }
}
