const fs = require('fs');
const path = require('path');

const emojis = {
  '📊': '<i data-lucide="bar-chart-3" size="18" stroke-width="2.5"></i>',
  '📅': '<i data-lucide="calendar" size="18" stroke-width="2.5"></i>',
  '➕': '<i data-lucide="plus" size="18" stroke-width="2.5"></i>',
  '👥': '<i data-lucide="users" size="18" stroke-width="2.5"></i>',
  '✅': '<i data-lucide="check-circle" size="18" stroke-width="2.5"></i>',
  '📈': '<i data-lucide="trending-up" size="18" stroke-width="2.5"></i>',
  '🚪': '<i data-lucide="log-out" size="16" stroke-width="2.5"></i>',
  '🔍': '<i data-lucide="search" size="18" stroke-width="2.5"></i>',
  '📭': '<i data-lucide="inbox" size="48" stroke-width="1.5"></i>',
  '📍': '<i data-lucide="map-pin" size="16" stroke-width="2"></i>',
  '📋': '<i data-lucide="clipboard-list" size="20" stroke-width="2.5"></i>',
  '👤': '<i data-lucide="user" size="48" stroke-width="1.5"></i>',
  '🔗': '<i data-lucide="link" size="20" stroke-width="2.5"></i>',
  '⚡': '<i data-lucide="zap" size="20" stroke-width="2.5"></i>',
  '📄': '<i data-lucide="file-text" size="16" stroke-width="2.5"></i>',
  '❌': '<i data-lucide="x-circle" size="18" stroke-width="2.5"></i>',
  '🎯': '<i data-lucide="target" size="48" stroke-width="1.5"></i>',
  '🔒': '<i data-lucide="lock" size="48" stroke-width="1.5"></i>',
  '🕐': '<i data-lucide="clock" size="18" stroke-width="2.5"></i>',
  '👋': '<i data-lucide="hand" size="24" stroke-width="2.5"></i>',
  '⏳': '<i data-lucide="hourglass" size="18" stroke-width="2.5"></i>',
  '🗓️': '<i data-lucide="calendar-days" size="28" stroke-width="2.5"></i>'
};

const headInject = `<script src="https://unpkg.com/lucide@latest"></script>`;
const bodyInject = `\n<script>if(window.lucide) { lucide.createIcons(); }</script>\n</body>`;

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Inject script in head
  if (!content.includes('lucide@latest') && content.includes('</head>')) {
    content = content.replace('</head>', `  ${headInject}\n</head>`);
  }

  // Inject createIcons before body ends
  if (!content.includes('lucide.createIcons') && content.includes('</body>')) {
    content = content.replace('</body>', bodyInject);
  }

  // Replace emojis
  Object.keys(emojis).forEach(emoji => {
    // Escape regex correctly
    const regex = new RegExp(emoji, 'g');
    content = content.replace(regex, emojis[emoji]);
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed', filePath);
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'assets') scanDir(fullPath);
    } else if (fullPath.endsWith('.html') && file !== 'login.html') {
      processFile(fullPath);
    }
  }
}

scanDir(__dirname);
