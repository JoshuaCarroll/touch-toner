const express = require('express');
const path = require('path');
const fs = require('fs');
const Updater = require('./updater');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Serve sound files
app.use('/sounds', express.static(path.join(__dirname, 'sounds')));

// API: list sounds
app.get('/api/sounds', (req, res) => {
  const dir = path.join(__dirname, 'sounds');
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: 'unable to read sounds directory' });
    const soundFiles = files.filter(f => /\.(mp3|wav|ogg)$/i.test(f));
    res.json(soundFiles);
  });
});

app.listen(PORT, () => {
  console.log(`Touch Toner server listening on port ${PORT}`);
});

// Start updater in background
const updater = new Updater({
  repo: process.env.GITHUB_REPO || null, // e.g. 'owner/repo' - optional; if not set, updater disabled
  intervalMs: process.env.UPDATE_INTERVAL_MS ? parseInt(process.env.UPDATE_INTERVAL_MS, 10) : 60_000
});

updater.start().catch(err => {
  console.error('Updater failed to start:', err.message);
});
