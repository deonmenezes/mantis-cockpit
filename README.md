<p align="center">
  <img src="assets/mantis-logo.png" alt="Mantis Cockpit" width="180" />
</p>

# Mantis Cockpit

> **Local-first desktop dashboard** for driving autonomous bug-bounty hunts with [Mantis](https://mantishack.com).

A single window over every hunt, finding, and agent on **your** machine. No cloud round-trip, no telemetry, no account required — the cockpit reads directly from the `.mantis/state/` files Mantis already writes to disk.

```
   ╭───────────────────────────────────────────────────╮
   │   Mantis Cockpit · local-first dashboard          │
   │                                                   │
   │   ▸ http://localhost:7137/                        │
   │                                                   │
   │   Scanning for .mantis/ state in:                 │
   │     · /Users/you                                  │
   │     · /Users/you/your-project                     │
   ╰───────────────────────────────────────────────────╯
```

## What's in the box

- **Dashboard** — live activity feed, hunt-completed counter, severity breakdown
- **Hunt detail** — 7-phase pipeline visualisation, live hunter tiles with terminal output, configuration kv-panel
- **Findings** — every finding across every hunt, filterable by severity / status

## Run it

You need **Node.js 18+**. Nothing else.

```bash
git clone https://github.com/deonmenezes/mantis-cockpit.git
cd mantis-cockpit
./start.sh
# or: node server.js
```

The cockpit opens at `http://localhost:7137/`. Mock data renders if no `.mantis/` directory is found — useful for exploring the UI before you've run a real hunt.

## How "local-first" works

The cockpit is a static HTML/CSS/JS frontend plus a **zero-dependency Node server** (`server.js`) that:

1. Serves the static files on `localhost:7137`.
2. Exposes a few read-only JSON endpoints (`/api/sessions`, `/api/activity`, `/api/findings`, `/api/stats`) that walk your local filesystem looking for `.mantis/state/sessions/*` directories.
3. Streams the JSONL files Mantis already writes (`findings.jsonl`, `audit.jsonl`) into the UI.

No outbound network calls. No telemetry. No accounts. You can airgap the machine and the cockpit still works.

### Where it looks for Mantis state

By default the cockpit scans:

- `$HOME/.mantis/state/sessions/`
- `$PWD/.mantis/state/sessions/`

Override with the `MANTIS_ROOTS` env var (colon-separated list):

```bash
MANTIS_ROOTS=/srv/mantis:/home/me/work node server.js
```

### Port / browser

```bash
PORT=8081 MANTIS_OPEN=0 node server.js
```

## File layout

```
mantis-cockpit/
├── server.js              # zero-dep local server + filesystem API
├── start.sh               # ./start.sh wrapper
├── index.html             # Dashboard
├── hunt.html              # Live hunt detail
├── findings.html          # Findings list
└── assets/
    ├── style.css          # cockpit styles (mantis-dark theme)
    ├── cockpit.js         # sidebar + topbar + footer partials
    ├── cockpit-data.js    # data loader (live API → fallback mock)
    └── mantis-logo.png
```

## Wrap as a real desktop app

The cockpit is intentionally a plain web app so you can pick your shell:

- **Tauri** — wrap `server.js` as a sidecar and the UI in a webview. ~5–10 MB binary.
- **Electron** — `BrowserWindow` pointing at `http://localhost:7137`. Familiar.
- **Pake / Nativefier** — one-shot wrappers, no code needed.
- **Just `open http://localhost:7137`** — that's a desktop cockpit too.

## Roadmap

- [ ] Live SSE stream of new findings while a hunt is running
- [ ] Per-session deep-link from sidebar
- [ ] "Open in editor" buttons for report markdown
- [ ] Wave / agent tree view
- [ ] Tauri build

## License

MIT. The Mantis framework itself lives at <https://github.com/deonmenezes/mantis-hack>.

---

⚠ **Disclaimer.** The cockpit is a read-only viewer over local files Mantis already writes. It does not perform any scanning, network requests against targets, or destructive actions. All actual hunting and authorization concerns are the responsibility of the underlying Mantis framework and the operator. Only test systems you own or are explicitly authorized to test.
