const fs = require('fs');

const shellTemplate = `
<div id="ce-root">
  <div class="shell">
    <div class="sb-overlay" id="sb-ov"></div>
    <aside class="sb" id="sb">
      <div class="sb-brand">
        <div class="sb-mark">
          <svg viewBox="0 0 24 24"><path d="M12 3L4 7v10l8 4 8-4V7z"/><path d="M12 3v18M4 7l8 4 8-4"/></svg>
        </div>
        <div class="sb-brand-text">
          <div class="sb-brand-name">Comagro</div>
          <div class="sb-brand-sub">Plataforma de Eventos</div>
        </div>
      </div>
      <nav class="sb-nav">
        <div class="sb-sect-label">General</div>
        <a href="/eventos-dashboard" class="sb-a">
          <span class="sb-ic"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></span>
          Dashboard
        </a>
        <a href="/eventos-lista" class="sb-a">
          <span class="sb-ic"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg></span>
          Eventos
        </a>
        <a href="/eventos-crear" class="sb-a">
          <span class="sb-ic"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg></span>
          Crear Evento
        </a>
        <div class="sb-sect-label">Gestión</div>
        <a href="/eventos-registrados" class="sb-a">
          <span class="sb-ic"><svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
          Registrados
        </a>
        <a href="/eventos-checkin" class="sb-a">
          <span class="sb-ic"><svg viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>
          Check-in
        </a>
        <a href="/eventos-reportes" class="sb-a">
          <span class="sb-ic"><svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6"/></svg></span>
          Reportes
        </a>
      </nav>
      <div class="sb-foot">
        <div class="sb-user">
          <div class="sb-avatar" id="sb-av">U</div>
          <div style="flex:1;min-width:0;">
            <div class="sb-uname" id="sb-uname">Cargando…</div>
            <div class="sb-urole" id="sb-urole">—</div>
          </div>
        </div>
        <button id="btn-logout" class="sb-logout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          Cerrar sesión
        </button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <button class="tb-hamburger" id="sb-tog" aria-label="Menú">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <div class="tb-title"><span>Comagro Eventos /</span> {{TITLE}}</div>
        <div class="tb-right">
          <button class="tb-iBtn" title="Notificaciones">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </button>
        </div>
      </header>
      <div class="page" id="page">
        {{PAGE_CONTENT}}
      </div>
    </div>
  </div>
  <div class="toast-stack" id="toasts"></div>
</div>
`;

const filesToMigrate = [
  'eventos/index.html',
  'eventos/crear.html',
  'eventos/admin.html',
  'registrados.html',
  'checkin.html',
  'reportes.html'
];

filesToMigrate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract main content
  const mainMatch = content.match(/<main class="page-content"[^>]*>([\s\S]*?)<\/main>/);
  if (!mainMatch) {
    console.log('Skipping ' + file + ' (no main match)');
    return;
  }
  let pageContent = mainMatch[1];
  
  // Update inner elements to match new design classes
  pageContent = pageContent.replace(/<div class="page-header[^>]*>/g, '<div class="welcome">');
  pageContent = pageContent.replace(/<div class="page-header-left[^>]*>/g, '<div class="welcome-left">');
  pageContent = pageContent.replace(/<div class="page-header-actions[^>]*>/g, '<div class="welcome-right" style="display:flex;gap:10px;">');
  
  // Replace card classes
  pageContent = pageContent.replace(/class="card-header"/g, 'class="card-hd"');
  pageContent = pageContent.replace(/class="card-body"/g, 'class="card-bd"');
  pageContent = pageContent.replace(/class="table-responsive"/g, 'class="tbl-wrap"');

  // Replace form labels and groups to ensure they fit the new design
  pageContent = pageContent.replace(/class="form-label"/g, 'class="form-label"'); // Keep form-label
  
  // Replace titles inside the new header
  pageContent = pageContent.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/g, '<div class="welcome-title">$1</div>');
  pageContent = pageContent.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/g, '<div class="card-hd-title">$1</div>');

  // Replace old badges
  pageContent = pageContent.replace(/badge-success/g, 'badge-green');
  pageContent = pageContent.replace(/badge-warning/g, 'badge-amber');
  pageContent = pageContent.replace(/badge-secondary/g, 'badge-gray');

  // Find page title for topbar
  let title = "Página";
  if (file.includes('crear.html')) title = "Crear Evento";
  if (file.includes('admin.html')) title = "Gestionar Evento";
  if (file.includes('index.html')) title = "Eventos";
  if (file.includes('registrados')) title = "Registrados";
  if (file.includes('checkin')) title = "Check-in";
  if (file.includes('reportes')) title = "Reportes";

  // Replace active nav state
  let currentShell = shellTemplate.replace('{{TITLE}}', title).replace('{{PAGE_CONTENT}}', pageContent);
  if (file.includes('index.html')) currentShell = currentShell.replace('href="/eventos-lista" class="sb-a"', 'href="/eventos-lista" class="sb-a active"');
  if (file.includes('crear.html')) currentShell = currentShell.replace('href="/eventos-crear" class="sb-a"', 'href="/eventos-crear" class="sb-a active"');
  if (file.includes('registrados.html')) currentShell = currentShell.replace('href="/eventos-registrados" class="sb-a"', 'href="/eventos-registrados" class="sb-a active"');
  if (file.includes('checkin.html')) currentShell = currentShell.replace('href="/eventos-checkin" class="sb-a"', 'href="/eventos-checkin" class="sb-a active"');
  if (file.includes('reportes.html')) currentShell = currentShell.replace('href="/eventos-reportes" class="sb-a"', 'href="/eventos-reportes" class="sb-a active"');

  // Re-inject into file
  const beforeLayout = content.split('<div class="app-layout">')[0];
  const parts = content.split('<div id="toast-container"></div>');
  const afterLayout = parts.length > 1 ? parts[1] : '';

  let newContent = beforeLayout + currentShell + afterLayout;
  
  // Fix script bindings for sidebar
  newContent = newContent.replace("document.getElementById('sidebar-toggle').addEventListener", "document.getElementById('sb-tog').addEventListener");
  newContent = newContent.replace("sidebar.classList.toggle('open');", "document.getElementById('sb').classList.toggle('open'); document.getElementById('sb-ov').classList.toggle('vis');");
  newContent = newContent.replace("document.getElementById('user-name').textContent", "document.getElementById('sb-uname').textContent");
  newContent = newContent.replace("document.getElementById('user-role').textContent", "document.getElementById('sb-urole').textContent");
  newContent = newContent.replace("document.getElementById('user-avatar').textContent", "document.getElementById('sb-av').textContent");

  fs.writeFileSync(file, newContent, 'utf8');
  console.log('Migrated ' + file);
});
