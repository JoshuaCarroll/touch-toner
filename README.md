# Touch Toner

Touchscreen soundboard for volunteer firefighters. Built with Node.js and a simple web UI optimized for small touchscreens. The app can automatically update from GitHub when a network connection is available and a newer commit exists.

Features
- Touch-friendly large buttons
- Plays local audio files (add to `sounds/`)
- Optional auto-updater that checks GitHub and runs `git pull` when a new commit is found

Quick start (on Raspberry Pi)

1. Install Node.js (recommended: Node 18+). On Raspberry Pi OS:

   ```powershell
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -; sudo apt-get install -y nodejs
   ```

2. Clone the repo to the Pi and install deps:

   ```powershell
   git clone https://github.com/<owner>/touch-toner.git /opt/touch-toner; cd /opt/touch-toner; npm install --production
   ```

3. Add your siren audio files into `/opt/touch-toner/sounds/` (mp3/wav/ogg).

4. (Optional) Set the env var `GITHUB_REPO=owner/repo` to enable auto-updates. Example systemd service below includes an example.

5. Create systemd service (example provided as `touch-toner.service`) and enable it. Then configure the Pi to open Chromium in kiosk mode pointing to http://localhost:3000 for a full-screen touchscreen experience.

Notes and safety
- The auto-updater performs `git pull` in the application directory and will exit the process after updating so a supervisor (systemd) can restart the updated app. Make sure the service is configured to restart on failure/exit.
- For higher isolation or to bundle assets, consider packaging this in an Electron wrapper or building a proper installer.

Files
- `server.js` - Express server and updater starter
- `updater.js` - GitHub polling and git pull logic
- `public/` - Frontend UI
- `sounds/` - Place audio files here
- `touch-toner.service` - example systemd unit
# touch-toner
PWA sound board
