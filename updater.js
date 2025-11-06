const fetch = require('node-fetch');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class Updater {
  constructor(opts = {}) {
    this.repo = opts.repo; // owner/repo
    this.intervalMs = opts.intervalMs || 60_000;
    this.timer = null;
    this.enabled = !!this.repo;
    this.lastShaFile = path.join(__dirname, '.last_sha');
  }

  async start() {
    if (!this.enabled) {
      console.log('Updater disabled (no GITHUB_REPO set)');
      return;
    }
    console.log('Updater enabled for', this.repo, 'interval', this.intervalMs);
    await this.checkOnce();
    this.timer = setInterval(() => this.checkOnce().catch(err => console.error('Updater error:', err.message)), this.intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async checkOnce() {
    const api = `https://api.github.com/repos/${this.repo}/commits/main`;
    console.log('Checking for updates at', api);
    const res = await fetch(api, { headers: { 'User-Agent': 'touch-toner-updater' } });
    if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);
    const data = await res.json();
    const sha = data.sha;
    const last = this._readLastSha();
    if (last === sha) {
      console.log('No update available');
      return;
    }
    console.log('New version detected:', sha, 'previous:', last);
    await this.pullAndRestart();
  }

  _readLastSha() {
    try {
      return fs.readFileSync(this.lastShaFile, 'utf8').trim();
    } catch (e) {
      return null;
    }
  }

  _writeLastSha(sha) {
    try {
      fs.writeFileSync(this.lastShaFile, sha, 'utf8');
    } catch (e) {
      console.error('Failed to write last SHA:', e.message);
    }
  }

  pullAndRestart() {
    return new Promise((resolve, reject) => {
      console.log('Performing git pull to update');
      exec('git pull --rebase', { cwd: __dirname }, (err, stdout, stderr) => {
        console.log(stdout);
        if (err) {
          console.error('git pull failed:', stderr || err.message);
          return reject(err);
        }
        // Update recorded sha from git
        exec('git rev-parse HEAD', { cwd: __dirname }, (e2, out2) => {
          if (!e2) this._writeLastSha(out2.trim());
          console.log('Update complete, exiting to allow supervisor restart');
          // exit process; assume systemd will restart
          process.exit(0);
        });
        resolve();
      });
    });
  }
}

module.exports = Updater;
