#!/usr/bin/env node
/*
 * Mantis Cockpit · local-first server
 *
 * Zero dependencies. Pure Node. Run with: `node server.js` (or `./start.sh`).
 *
 * Serves the static UI from this directory and exposes a few read-only JSON
 * endpoints that scan your local Mantis state directories — by default the
 * `.mantis` folder under your home directory and the current working dir —
 * so the cockpit reflects real session data without any cloud round-trip.
 *
 * Env:
 *   PORT           default 7137
 *   MANTIS_ROOTS   colon-separated list of dirs to scan for .mantis/state
 *                  default: $HOME, $PWD
 *   MANTIS_OPEN    "1" to auto-open the browser on start (default 1 in TTY)
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');
const { exec } = require('child_process');

const PORT = parseInt(process.env.PORT || '7137', 10);
const ROOT = __dirname;
const HOME = process.env.HOME || process.env.USERPROFILE || '';
const ROOTS = (process.env.MANTIS_ROOTS || [HOME, process.cwd()].join(':'))
  .split(':').map(s => s.trim()).filter(Boolean);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
  '.md':   'text/markdown; charset=utf-8',
};

function safeJoin(base, requested) {
  const target = path.normalize(path.join(base, requested));
  if (!target.startsWith(base)) return null;
  return target;
}

function sendJSON(res, status, body) {
  const buf = Buffer.from(JSON.stringify(body));
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': buf.length,
    'Cache-Control': 'no-store',
  });
  res.end(buf);
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('not found');
}

function readJSONSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
function readJSONLSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8').split('\n')
      .filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } })
      .filter(Boolean);
  } catch { return []; }
}

// ── Local discovery: walk MANTIS_ROOTS looking for .mantis/state/sessions ──
function findSessions() {
  const out = [];
  for (const root of ROOTS) {
    if (!root) continue;
    const dir = path.join(root, '.mantis', 'state', 'sessions');
    if (!fs.existsSync(dir)) continue;
    let ents;
    try { ents = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { continue; }
    for (const e of ents) {
      if (!e.isDirectory()) continue;
      const sess = path.join(dir, e.name);
      out.push({ root, id: e.name, dir: sess });
    }
  }
  return out;
}

function collectFindings() {
  const items = [];
  for (const s of findSessions()) {
    const f = path.join(s.dir, 'findings.jsonl');
    for (const row of readJSONLSafe(f)) {
      items.push({
        id: row.id || row.finding_id || '—',
        title: row.title || row.summary || '(no title)',
        target: row.target || s.id,
        sev: (row.severity || row.cvss_severity || 'info').toLowerCase(),
        status: row.status || 'Pending',
        found: row.timestamp || '—',
      });
    }
  }
  return items;
}

function collectActivity() {
  const items = [];
  for (const s of findSessions()) {
    const f = path.join(s.dir, 'audit.jsonl');
    for (const row of readJSONLSafe(f)) {
      items.push({
        event: row.event || row.action || '(unknown)',
        icon: row.icon || '•',
        target: row.target || s.id,
        sev:  (row.severity || 'info').toLowerCase(),
        agent: row.agent || row.actor || '—',
        ts: row.timestamp || '',
      });
    }
  }
  return items;
}

function collectStats() {
  const sessions = findSessions();
  const findings = collectFindings();
  return {
    hacks_completed: sessions.length,
    findings_total: findings.length,
    verified: findings.filter(f => /verified/i.test(f.status)).length,
    reported: findings.filter(f => /reported/i.test(f.status)).length,
    roots: ROOTS,
  };
}

// ── Server ──
const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  let pathname = decodeURIComponent(parsed.pathname || '/');

  // API endpoints — read from local .mantis state
  if (pathname.startsWith('/api/')) {
    try {
      if (pathname === '/api/sessions')  return sendJSON(res, 200, { items: findSessions().map(s => ({ id: s.id, root: s.root })) });
      if (pathname === '/api/findings')  return sendJSON(res, 200, { items: collectFindings() });
      if (pathname === '/api/activity')  return sendJSON(res, 200, { items: collectActivity() });
      if (pathname === '/api/stats')     return sendJSON(res, 200, collectStats());
      return sendJSON(res, 404, { error: 'unknown endpoint' });
    } catch (err) {
      return sendJSON(res, 500, { error: String(err && err.message || err) });
    }
  }

  // Static file serving
  if (pathname === '/') pathname = '/index.html';
  const target = safeJoin(ROOT, pathname);
  if (!target || !fs.existsSync(target)) return send404(res);

  let stat;
  try { stat = fs.statSync(target); } catch { return send404(res); }
  if (stat.isDirectory()) return send404(res);

  const ext = path.extname(target).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, {
    'Content-Type': type,
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(target).pipe(res);
});

server.listen(PORT, '127.0.0.1', () => {
  const u = `http://localhost:${PORT}/`;
  console.log('');
  console.log('   ╭───────────────────────────────────────────────────╮');
  console.log('   │   Mantis Cockpit · local-first dashboard          │');
  console.log('   │                                                   │');
  console.log(`   │   ▸ ${u.padEnd(45)}│`);
  console.log('   │                                                   │');
  console.log('   │   Scanning for .mantis/ state in:                 │');
  for (const r of ROOTS) {
    const line = `     · ${r}`.slice(0, 50).padEnd(50);
    console.log(`   │ ${line}│`);
  }
  console.log('   ╰───────────────────────────────────────────────────╯');
  console.log('');

  const open = (process.env.MANTIS_OPEN === '1') || (process.env.MANTIS_OPEN !== '0' && process.stdout.isTTY);
  if (open) {
    const cmd = process.platform === 'darwin' ? `open "${u}"`
              : process.platform === 'win32'  ? `start "" "${u}"`
              : `xdg-open "${u}"`;
    exec(cmd, () => {});
  }
});
