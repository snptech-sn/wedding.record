const fs = require('fs');

try {
  if (fs.existsSync('dist')) {
    fs.cpSync('dist', 'docs', { recursive: true });
    console.log('Synced dist to docs for GitHub Pages');
  }
} catch (e) {
  console.error('Error syncing dist to docs:', e);
}
