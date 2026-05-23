'use strict';
// Copies the 9 latin-subset woff2 files from @fontsource packages into public/fonts/.
// Vite serves public/ as static files — no CSS @import chain resolution, no woff2 url() crawl.
// Run automatically on `npm install` via the postinstall hook.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dest = path.join(root, 'public', 'fonts');

const files = [
  { pkg: 'ibm-plex-sans', name: 'ibm-plex-sans-latin-400-normal.woff2' },
  { pkg: 'ibm-plex-sans', name: 'ibm-plex-sans-latin-400-italic.woff2' },
  { pkg: 'ibm-plex-sans', name: 'ibm-plex-sans-latin-500-normal.woff2' },
  { pkg: 'ibm-plex-sans', name: 'ibm-plex-sans-latin-600-normal.woff2' },
  { pkg: 'ibm-plex-sans', name: 'ibm-plex-sans-latin-700-normal.woff2' },
  { pkg: 'ibm-plex-mono', name: 'ibm-plex-mono-latin-400-normal.woff2' },
  { pkg: 'ibm-plex-mono', name: 'ibm-plex-mono-latin-400-italic.woff2' },
  { pkg: 'ibm-plex-mono', name: 'ibm-plex-mono-latin-500-normal.woff2' },
  { pkg: 'ibm-plex-mono', name: 'ibm-plex-mono-latin-600-normal.woff2' },
];

if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

for (const { pkg, name } of files) {
  const src = path.join(root, 'node_modules', '@fontsource', pkg, 'files', name);
  fs.copyFileSync(src, path.join(dest, name));
  console.log(`copied ${name}`);
}
