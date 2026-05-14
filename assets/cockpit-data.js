// Mock data + live fetcher. Local-first: tries to load from the cockpit server's
// /api/* endpoints first (which read real .mantis/state/*.json files on disk),
// and falls back to baked-in mock rows so the UI works even without the server.

(function () {
  const ACTIVITY = [
    { event: 'Verified — IDOR confirmed', icon: '⚑', target: 'api.target.example.com', sev: 'crit',  agent: 'verifier-r3', ts: '14:42:08' },
    { event: 'Hunter wave 2 spawned',     icon: '⚡', target: 'target.example.com',     sev: 'info', agent: 'orchestrator', ts: '14:38:22' },
    { event: 'Auth bypass · JWT kid',     icon: '★',  target: 'auth.target.example.com', sev: 'crit', agent: 'hunter-003',   ts: '14:31:55' },
    { event: 'SSRF · IPv6 bypass works',  icon: '★',  target: 'api.target.example.com', sev: 'high', agent: 'hunter-004',   ts: '14:24:19' },
    { event: 'Report submitted · H1',     icon: '↗',  target: 'mail.shop-x.io',         sev: 'high', agent: 'report-writer',ts: '13:55:01' },
    { event: 'Brutalist verifier · pass', icon: '✓',  target: 'app.acme.dev',            sev: 'med',  agent: 'verifier-r1',  ts: '13:41:47' },
    { event: 'Recon · 24 subdomains',     icon: '⌕',  target: 'target.example.com',     sev: 'info', agent: 'recon-agent',  ts: '13:14:33' },
    { event: 'Finding rejected · dup',    icon: '⨯',  target: 'auth.target.example.com', sev: 'info', agent: 'verifier-r2',  ts: '12:58:09' },
    { event: 'New hunt started',          icon: '+',  target: 'shop-x.io',              sev: 'info', agent: 'orchestrator', ts: '12:22:51' },
    { event: 'Verified — SQLi blind',     icon: '⚑', target: 'reports.acme.dev',        sev: 'crit',  agent: 'verifier-r3', ts: '11:47:18' },
    { event: 'Bypass · Cloudflare cache', icon: '★',  target: 'cdn.shop-x.io',          sev: 'med',  agent: 'hunter-007',   ts: '11:14:02' },
    { event: 'Scope guard · blocked',     icon: '◑',  target: 'oob.unscoped.test',       sev: 'info', agent: 'scope-guard',  ts: '10:33:24' },
  ];

  const FINDINGS = [
    { id: 'F-127', title: 'IDOR — read any customer invoice via /api/v2/invoices/{id}',  target: 'api.target.example.com', sev: 'crit', status: 'Verified', found: '14:42 today' },
    { id: 'F-126', title: 'JWT auth bypass via kid path traversal on /api/auth/login',   target: 'auth.target.example.com', sev: 'crit', status: 'Verified', found: '14:31 today' },
    { id: 'F-125', title: 'SSRF via /api/preview — IPv6 metadata bypass on instance role',target: 'api.target.example.com', sev: 'high', status: 'Verifying', found: '14:24 today' },
    { id: 'F-124', title: 'Stored XSS in profile bio executes in admin panel',           target: 'app.acme.dev',            sev: 'high', status: 'Reported', found: 'yesterday' },
    { id: 'F-123', title: 'Cloudflare cache deception via .css path on /api',            target: 'cdn.shop-x.io',          sev: 'med',  status: 'Verified', found: 'yesterday' },
    { id: 'F-122', title: 'Race condition on coupon-apply endpoint',                     target: 'shop-x.io',              sev: 'med',  status: 'Verified', found: '2 days ago' },
    { id: 'F-121', title: 'Open redirect on /signin?next=',                              target: 'auth.target.example.com', sev: 'low',  status: 'Pending',  found: '2 days ago' },
    { id: 'F-120', title: 'Information disclosure — stack trace on /api/v1/search',     target: 'api.target.example.com', sev: 'low',  status: 'Pending',  found: '3 days ago' },
  ];

  function fetchJSON(path) {
    return fetch(path, { credentials: 'omit' }).then(r => r.ok ? r.json() : null).catch(() => null);
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function activityRow(r) {
    return `<tr>
      <td class="cell-event">
        <span class="ev-icon">${escapeHTML(r.icon)}</span>
        <span>${escapeHTML(r.event)}</span>
      </td>
      <td class="mono">${escapeHTML(r.target)}</td>
      <td><span class="tag ${escapeHTML(r.sev)}">${r.sev.toUpperCase()}</span></td>
      <td class="mono" style="color: var(--dim)">${escapeHTML(r.agent)}</td>
      <td class="ts">${escapeHTML(r.ts)}</td>
    </tr>`;
  }

  function findingRow(f) {
    const statusColor = f.status === 'Verified' ? 'var(--accent-hi)'
                      : f.status === 'Reported' ? 'var(--blue)'
                      : f.status === 'Verifying' ? 'var(--amber)'
                      : 'var(--dim)';
    return `<tr>
      <td class="mono" style="color: var(--accent-hi); font-weight: 600">${escapeHTML(f.id)}</td>
      <td>${escapeHTML(f.title)}</td>
      <td class="mono" style="color: var(--dim)">${escapeHTML(f.target)}</td>
      <td><span class="tag ${escapeHTML(f.sev)}">${f.sev.toUpperCase()}</span></td>
      <td style="color: ${statusColor}; font-weight: 500; font-size: 12.5px">${escapeHTML(f.status)}</td>
      <td class="ts">${escapeHTML(f.found)}</td>
    </tr>`;
  }

  window.CockpitData = {
    async renderActivity(tbody) {
      if (!tbody) return;
      const live = await fetchJSON('/api/activity');
      const rows = (live && live.items) || ACTIVITY;
      tbody.innerHTML = rows.map(activityRow).join('');
    },
    async renderFindings(tbody) {
      if (!tbody) return;
      const live = await fetchJSON('/api/findings');
      const rows = (live && live.items) || FINDINGS;
      tbody.innerHTML = rows.map(findingRow).join('');
    },
    async loadStats(sel) {
      const live = await fetchJSON('/api/stats');
      const el = document.querySelector(sel);
      if (el && live && typeof live.hacks_completed === 'number') {
        el.textContent = live.hacks_completed;
      }
    },
  };
})();
