const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'assets', 'css', 'main.css');
let cssContent = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : '';

const magentoReset = `
/* Overlay wrapper to ensure the app takes full screen inside the CMS content area */
.comagro-app-root {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 2147483647 !important;
  box-sizing: border-box !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  font-size: 16px !important;
}
`;

cssContent = magentoReset + '\n' + cssContent;

const outDir = path.join(__dirname, 'adobe_ready');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

const urlMap = {
  'login.html': '/eventos-login',
  'dashboard.html': '/eventos-dashboard',
  'index.html': '/eventos-lista', // For eventos/index.html
  'crear.html': '/eventos-crear', // For eventos/crear.html
  'admin.html': '/eventos-admin', // For eventos/admin.html
  'registrados.html': '/eventos-registrados',
  'checkin.html': '/eventos-checkin',
  'reportes.html': '/eventos-reportes',
  'registro.html': '/registro-evento'
};

const regexes = [
  { rx: /(["'`])(?:\.\/|\.\.\/)*login\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-login$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*dashboard\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-dashboard$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*eventos\/index\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-lista$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*index\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-lista$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*eventos\/crear\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-crear$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*crear\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-crear$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*eventos\/admin\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-admin$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*admin\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-admin$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*registrados\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-registrados$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*checkin\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-checkin$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*reportes\.html(\?.*?)?(["'`])/g, rep: '$1/eventos-reportes$2$3' },
  { rx: /(["'`])(?:\.\/|\.\.\/)*registro\.html(\?.*?)?(["'`])/g, rep: '$1/registro-evento$2$3' },
  { rx: /(["'])\/login(["'])/g, rep: '$1/eventos-login$2' }, // Para el OTP viejo
  { rx: /<script src="https:\/\/unpkg\.com\/lucide@latest"><\/script>/g, rep: '<script>var _rjsDef = window.define; window.define = undefined;</script>\n<script src="https://cdn.jsdelivr.net/npm/lucide@0.383.0/dist/umd/lucide.min.js"></script>\n<script>window.define = _rjsDef;</script>' },
  { rx: /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js@4"><\/script>/g, rep: '<script>var _rjsDef2 = window.define; window.define = undefined;</script>\n<script src="https://cdn.jsdelivr.net/npm/chart.js@4"></script>\n<script>window.define = _rjsDef2;</script>' },
  { rx: /sb_publishable_7ZT8qNtk0oNRs2_8fmhyzA_gLzdVDNc/g, rep: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0eWxwdnV6ZmxxbG1tcXZkaGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNjYzMTgsImV4cCI6MjA5MTg0MjMxOH0.yuZ5sWX-Isxd04ySP_ZgDLit1fQDsxoeb25GmU_C_5I' }
];

function processFile(filePath, fileName) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace body { with .comagro-app-root { to prevent styling the global Magento body
  content = content.replace(/body\s*\{/g, '.comagro-app-root {');

  // Wrap body content inside the breakout div
  content = content.replace(/<body>/i, '<body>\n<div class="comagro-app-root">');
  content = content.replace(/<\/body>/i, '</div>\n</body>');

  // Inject CSS Reset and Styles
  const cssLinkRegex = /<link rel="stylesheet" href="[^"]*main\.css">/i;
  
  if (cssLinkRegex.test(content)) {
    content = content.replace(cssLinkRegex, `<style>\n${cssContent}\n</style>`);
  } else {
    // For files that don't have the external link (like login.html and registro.html),
    // inject the magentoReset right after their existing <style> tag.
    content = content.replace(/<style>/i, `<style>\n${magentoReset}\n`);
  }

  // Replace URLs
  regexes.forEach(item => {
    content = content.replace(item.rx, item.rep);
  });

  // Specifically fix admin.html public link generation
  if (fileName === 'admin.html') {
    content = content.replace(
      /const publicUrl = `\$\{baseUrl\}\$\{rootPath\}\/registro\.html\?slug=\$\{ev\.slug\}`;/,
      'const publicUrl = `${baseUrl}/registro-evento?slug=${ev.slug}`;'
    );
  }

  // Fix Lucide: remove any existing createIcons call blocks and inject a reliable one
  content = content.replace(/<script>[^<]*lucide\.createIcons[^<]*<\/script>/g, '');
  content = content.replace(
    '</div>\n</body>',
    '<script>var _li = setInterval(function(){if(window.lucide){window.lucide.createIcons();clearInterval(_li);}}, 150);</script>\n</div>\n</body>'
  );

  // Define new filename for the exported block
  let outName = urlMap[fileName] ? urlMap[fileName].replace('/', '') + '.html' : fileName;
  
  fs.writeFileSync(path.join(outDir, outName), content, 'utf8');
  console.log(`Exported: ${outName}`);
}

const files = fs.readdirSync(__dirname);
files.forEach(file => {
  if (file.endsWith('.html') && file !== '1. login.html' && file !== 'index.html') {
    processFile(path.join(__dirname, file), file);
  }
});

const eventosDir = path.join(__dirname, 'eventos');
if (fs.existsSync(eventosDir)) {
  const eventosFiles = fs.readdirSync(eventosDir);
  eventosFiles.forEach(file => {
    if (file.endsWith('.html')) {
      processFile(path.join(eventosDir, file), file);
    }
  });
}
