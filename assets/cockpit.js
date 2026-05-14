// Mantis Cockpit — shared sidebar/topbar injection + light interactions.
// All data is mock for the static demo. Wire to real Mantis MCP later.

(function () {
  const ICONS = {
    dashboard: '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5.5" height="5.5" rx="1"/><rect x="8.5" y="2" width="5.5" height="3.5" rx="1"/><rect x="8.5" y="6.5" width="5.5" height="7.5" rx="1"/><rect x="2" y="8.5" width="5.5" height="5.5" rx="1"/></svg>',
    hunts:    '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8l4-5 4 7 4-4"/></svg>',
    findings: '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg>',
    reports:  '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h7l3 3v9H3z"/><path d="M10 2v3h3"/><path d="M5 8h6M5 11h6"/></svg>',
    assets:   '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2l6 3-6 3-6-3 6-3z"/><path d="M2 8l6 3 6-3"/><path d="M2 11l6 3 6-3"/></svg>',
    scopes:   '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M2 8h12M8 2v12"/></svg>',
    bypass:   '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4h12M2 8h8M2 12h12"/></svg>',
    hunters:  '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="5" r="2.5"/><path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg>',
    verifiers:'<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l5 2v4c0 3-2 5.5-5 6.5-3-1-5-3.5-5-6.5V3l5-2z"/><path d="M5.5 7.5L7 9l3.5-3.5"/></svg>',
    graders:  '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 13l3-8 3 5 3-3 3 6"/></svg>',
    mcp:      '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="9" y="2" width="5" height="5" rx="1"/><rect x="2" y="9" width="5" height="5" rx="1"/><rect x="9" y="9" width="5" height="5" rx="1"/></svg>',
    models:   '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="3"/><circle cx="8" cy="8" r="6"/></svg>',
    skills:   '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l2 4 5 .7-3.5 3.5.8 5L8 11.7 3.7 14.2l.8-5L1 5.7 6 5z"/></svg>',
    settings: '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="2"/><path d="M8 1v2M8 13v2M3 8H1M15 8h-2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"/></svg>',
    docs:     '<svg class="icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2h7l3 3v9H3z"/><path d="M5 6h6M5 9h6M5 12h4"/></svg>',
    bell:     '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6a4 4 0 018 0v3l1.5 2H2.5L4 9V6z"/><path d="M6.5 13a1.5 1.5 0 003 0"/></svg>',
    alert:    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1.5l7 12H1z"/><path d="M8 6v3M8 11v.5"/></svg>',
  };

  const NAV = [
    { group: 'Hunt', items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', href: 'index.html' },
      { id: 'hunts',     label: 'Live Hunts', icon: 'hunts',    href: 'hunt.html', count: '3' },
      { id: 'findings',  label: 'Findings',   icon: 'findings', href: 'findings.html', count: '127' },
      { id: 'reports',   label: 'Reports',    icon: 'reports',  href: '#', count: '42' },
    ]},
    { group: 'Targets', items: [
      { id: 'assets',  label: 'Assets',       icon: 'assets',  href: '#', count: '89' },
      { id: 'scopes',  label: 'Scopes',       icon: 'scopes',  href: '#' },
      { id: 'bypass',  label: 'Bypass Tables',icon: 'bypass',  href: '#' },
    ]},
    { group: 'Agents', items: [
      { id: 'hunters',   label: 'Hunters',   icon: 'hunters',   href: '#', count: '12' },
      { id: 'verifiers', label: 'Verifiers', icon: 'verifiers', href: '#', count: '3' },
      { id: 'graders',   label: 'Graders',   icon: 'graders',   href: '#' },
    ]},
    { group: 'Toolbelt', items: [
      { id: 'mcp',    label: 'MCP Tools', icon: 'mcp',    href: '#', count: '27' },
      { id: 'models', label: 'Models',    icon: 'models', href: '#' },
      { id: 'skills', label: 'Skills',    icon: 'skills', href: '#' },
    ]},
    { group: 'More', items: [
      { id: 'settings', label: 'Settings', icon: 'settings', href: '#' },
      { id: 'docs',     label: 'Docs',     icon: 'docs',     href: 'https://mantishack.com/docs/' },
    ]},
  ];

  function renderSidebar(activeId) {
    const groups = NAV.map(g => `
      <div class="nav-group">
        <div class="nav-group-title">${g.group}</div>
        <ul>
          ${g.items.map(it => `
            <li>
              <a class="nav-item ${it.id === activeId ? 'active' : ''}" href="${it.href}">
                ${ICONS[it.icon] || ''}
                <span>${it.label}</span>
                ${it.count ? `<span class="count">${it.count}</span>` : ''}
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    `).join('');

    return `
      <aside class="sidebar">
        <a class="brand" href="index.html">
          <img src="assets/mantis-logo.png" alt="Mantis" />
          <span class="brand-text">
            <span class="name">Mantis Cockpit</span>
            <span class="tag">v0.1 · local</span>
          </span>
        </a>
        <div class="org-switch">
          <span><span class="org-dot"></span>deonmenezes / personal</span>
          <span class="chev">▾</span>
        </div>
        ${groups}
        <div class="sidebar-footer">
          <span><span class="status-dot"></span>MCP connected</span>
          <span>27 tools</span>
        </div>
      </aside>
    `;
  }

  function renderTopbar(crumb) {
    const crumbHtml = crumb.map((c, i) => i === crumb.length - 1
      ? `<span class="cur">${c}</span>`
      : `<span>${c}</span><span class="sep">›</span>`
    ).join('');
    return `
      <div class="topbar">
        <div class="crumbs">${crumbHtml}</div>
        <div class="topbar-search">
          <input type="text" placeholder="Search hunts, findings, agents…" />
        </div>
        <div class="topbar-actions">
          <button class="icon-btn" title="Alerts" style="position:relative">
            ${ICONS.alert}
            <span class="pill red">7</span>
          </button>
          <button class="icon-btn" title="Notifications" style="position:relative">
            ${ICONS.bell}
            <span class="pill amber">12</span>
          </button>
          <button class="icon-btn" title="Settings">${ICONS.settings}</button>
          <div class="avatar" title="deonmenezes">DM</div>
        </div>
      </div>
    `;
  }

  function renderFooter() {
    return `
      <div class="foot-ribbon">
        <img src="assets/mantis-logo.png" alt="" />
        <span><strong>mantis/cockpit</strong> — drive autonomous bug-bounty hunts from one window.</span>
        <a href="https://mantishack.com" target="_blank" rel="noopener">Learn more →</a>
      </div>
    `;
  }

  window.Cockpit = {
    mount({ page, crumb }) {
      const shell = document.getElementById('cockpit');
      if (!shell) return;
      const main = shell.querySelector('.main');
      shell.insertAdjacentHTML('afterbegin', renderSidebar(page));
      main.insertAdjacentHTML('afterbegin', renderTopbar(crumb || ['Cockpit']));
      document.body.insertAdjacentHTML('beforeend', renderFooter());
    },
  };
})();
