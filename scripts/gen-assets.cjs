'use strict';
/**
 * General-purpose SVG → PNG converter.
 *
 * Usage:
 *   node scripts/gen-assets.cjs                          runs favicon + og modes
 *   node scripts/gen-assets.cjs --mode favicon           favicon.png (512px) + favicon.ico (16/32/48)
 *   node scripts/gen-assets.cjs --mode og                og.png (1200×630) via Playwright
 *   node scripts/gen-assets.cjs --mode custom \
 *     --input public/foo.svg --output public/foo.png --width 800
 *
 * Renderer notes:
 *   favicon / custom → @resvg/resvg-js (native, offline, no browser)
 *   og               → Playwright chromium (og.svg embeds WOFF2 fonts; resvg only supports WOFF/TTF)
 */

const fs   = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const root = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Core resvg helpers
// ---------------------------------------------------------------------------

function renderPng(svgContent, width) {
  const resvg = new Resvg(svgContent, { fitTo: { mode: 'width', value: width } });
  return resvg.render().asPng();
}

function buildIco(pngBuffers, sizes) {
  const count = sizes.length;
  const HEADER_SIZE    = 6;
  const DIR_ENTRY_SIZE = 16;

  const dataStart = HEADER_SIZE + count * DIR_ENTRY_SIZE;
  const offsets   = [];
  let cursor = dataStart;
  for (const buf of pngBuffers) {
    offsets.push(cursor);
    cursor += buf.length;
  }

  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: 1 = icon
  header.writeUInt16LE(count, 4);

  const dirEntries = pngBuffers.map((buf, i) => {
    const dim   = sizes[i] >= 256 ? 0 : sizes[i]; // 256 is encoded as 0 per spec
    const entry = Buffer.alloc(DIR_ENTRY_SIZE);
    entry.writeUInt8(dim, 0);              // width
    entry.writeUInt8(dim, 1);              // height
    entry.writeUInt8(0, 2);               // color count (0 = no palette)
    entry.writeUInt8(0, 3);               // reserved
    entry.writeUInt16LE(1, 4);            // color planes
    entry.writeUInt16LE(32, 6);           // bits per pixel
    entry.writeUInt32LE(buf.length, 8);   // data size
    entry.writeUInt32LE(offsets[i], 12);  // data offset
    return entry;
  });

  return Buffer.concat([header, ...dirEntries, ...pngBuffers]);
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

const MODES = {
  favicon: {
    async run() {
      const svg      = fs.readFileSync(path.join(root, 'public', 'favicon.svg'));
      const PNG_SIZE = 512;
      const ICO_SIZES = [16, 32, 48];

      fs.writeFileSync(path.join(root, 'public', 'favicon.png'), renderPng(svg, PNG_SIZE));
      process.stdout.write(`  favicon.png  ${PNG_SIZE}×${PNG_SIZE}\n`);

      const icoPngs = ICO_SIZES.map(s => renderPng(svg, s));
      fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), buildIco(icoPngs, ICO_SIZES));
      process.stdout.write(`  favicon.ico  ${ICO_SIZES.join('/')}px\n`);
    },
  },

  og: {
    async run() {
      // og.svg embeds WOFF2 fonts which resvg does not decode.
      // Playwright (chromium) handles WOFF2 correctly and is already a devDep.
      const { chromium } = await import('@playwright/test');
      const W = 1200, H = 630;
      const svg  = fs.readFileSync(path.join(root, 'public', 'og.svg'), 'utf8');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>*{margin:0;padding:0;box-sizing:border-box;}body{width:${W}px;height:${H}px;overflow:hidden;}</style>
</head><body>${svg}</body></html>`;

      const browser = await chromium.launch();
      const page    = await browser.newPage();
      await page.setViewportSize({ width: W, height: H });
      await page.setContent(html, { waitUntil: 'networkidle' });
      await page.screenshot({
        path: path.join(root, 'public', 'og.png'),
        clip: { x: 0, y: 0, width: W, height: H },
      });
      await page.close();
      await browser.close();
      process.stdout.write(`  og.png  ${W}×${H}\n`);
    },
  },

  custom: {
    async run({ input, output, width }) {
      if (!input || !output || !width) {
        throw new Error('custom mode requires --input <path> --output <path> --width <n>');
      }
      const svg = fs.readFileSync(input);
      fs.writeFileSync(output, renderPng(svg, parseInt(width, 10)));
      process.stdout.write(`  ${output}  (width: ${width}px)\n`);
    },
  },
};

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function getArg(args, flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : undefined;
}

(async () => {
  const args     = process.argv.slice(2);
  const modeName = getArg(args, '--mode') ?? 'all';

  const run = async (name) => {
    const mode = MODES[name];
    if (!mode) {
      process.stderr.write(`Unknown mode: ${name}. Available: all, favicon, og, custom\n`);
      process.exit(1);
    }
    await mode.run({
      input:  getArg(args, '--input'),
      output: getArg(args, '--output'),
      width:  getArg(args, '--width'),
    });
  };

  process.stdout.write('Generating assets...\n');

  if (modeName === 'all') {
    await run('favicon');
    await run('og');
  } else {
    await run(modeName);
  }

  process.stdout.write('Done.\n');
})().catch(err => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
