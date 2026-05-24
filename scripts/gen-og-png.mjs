/**
 * Renders public/og.svg → public/og.png at 1200×630
 * Uses the Playwright chromium browser already installed for e2e tests.
 *
 * Usage: node scripts/gen-og-png.mjs
 */
import { chromium } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

async function renderSvgToPng(browser, svgFile, pngFile, width, height) {
  const svg = readFileSync(svgFile, 'utf8');
  // Font is embedded in og.svg via @font-face — no CDN needed.
  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{width:${width}px;height:${height}px;overflow:hidden;}</style>
</head>
<body>${svg}</body>
</html>`;

  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: pngFile, clip: { x: 0, y: 0, width, height } });
  await page.close();
  console.log(`  ✓ ${pngFile}`);
}

const browser = await chromium.launch();
console.log('Generating images...');

await renderSvgToPng(
  browser,
  resolve(publicDir, 'og.svg'),
  resolve(publicDir, 'og.png'),
  1200, 630
);

await browser.close();
console.log('Done.');
