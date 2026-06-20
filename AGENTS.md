# Mantis Cockpit

A local-first desktop dashboard for driving autonomous bug-bounty hunts with Mantis. Provides a single browser window over every hunt, finding, and agent on your machine — no cloud round-trip, no telemetry, no account required. Reads directly from `.mantis/state/` files that Mantis writes to disk.

## Tech Stack

- **Language:** JavaScript (Node.js, no build step)
- **Server:** `server.js` — simple HTTP server, zero npm dependencies
- **Frontend:** Vanilla HTML/CSS/JS (`index.html`, `hunt.html`, `findings.html`)
- **Runtime:** Node.js >= 18

## Setup

```bash
git clone https://github.com/deonmenezes/mantis-cockpit.git
cd mantis-cockpit
# No npm install needed — zero production dependencies
```

## Build / Run / Test

```bash
# Start the cockpit (either method works)
./start.sh
# or:
node server.js

# For development (same as start)
npm run dev
```

Opens at `http://localhost:7137/`. Mock data renders if no `.mantis/` directory is found.

## Project Structure

```
server.js            # HTTP server; serves static files and reads .mantis/state/
index.html           # Dashboard view (activity feed, hunt counter, severity breakdown)
hunt.html            # Hunt detail (7-phase pipeline, live hunter tiles, config panel)
findings.html        # All findings across hunts, filterable by severity/status
assets/              # Static assets (logo, icons)
start.sh             # Shell launcher
package.json         # Minimal manifest (no deps)
```

## Architecture & Key Files

- `server.js` — serves all HTML pages and provides a local API that reads `.mantis/state/` JSON files from disk
- `index.html` / `hunt.html` / `findings.html` — vanilla JS polls the local API; no framework, no bundler
- `.mantis/state/` — written by the Mantis CLI; the cockpit is read-only with respect to this data
- Mock data is used automatically when `.mantis/` is absent — safe to explore the UI without running a real hunt

## Conventions & Notes for Agents

- Zero npm dependencies in production — do not add any; keep it dependency-free
- No build step — changes to `.js`/`.html`/`.css` files are live immediately on server restart
- The cockpit is read-only: it never writes to `.mantis/state/`, it only reads
- Port is hardcoded to `7137`; do not change without updating `start.sh` and documentation
- Node.js >= 18 required (uses modern built-ins)
