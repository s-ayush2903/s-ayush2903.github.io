import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const indexCss = readFileSync(resolve(__dirname, '../../index.css'), 'utf8');

describe('Dark mode CSS variables', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('dark');
  });

  it('document starts without dark class', () => {
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('can toggle dark class', () => {
    document.documentElement.classList.add('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    document.documentElement.classList.remove('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('dark mode callout variables are defined in CSS', () => {
    const darkCalloutVars = [
      '--callout-tip-bg',
      '--callout-tip-border',
      '--callout-tip-text',
      '--callout-warning-bg',
      '--callout-warning-border',
      '--callout-warning-text',
      '--callout-gotcha-bg',
      '--callout-gotcha-border',
      '--callout-gotcha-text',
    ];
    for (const v of darkCalloutVars) {
      expect(indexCss).toContain(v);
    }
  });

  it('dark mode code variables are defined in CSS', () => {
    const codeVars = ['--code-bg', '--code-border'];
    for (const v of codeVars) {
      expect(indexCss).toContain(v);
    }
  });
});

describe('Palette theme CSS selectors', () => {
  const palettes = ['rose-pine', 'gruvbox', 'nord', 'one-dark'] as const;

  for (const palette of palettes) {
    it(`defines light-mode selector for ${palette}`, () => {
      expect(indexCss).toContain(`[data-theme="${palette}"]`);
    });

    it(`defines dark-mode selector for ${palette}`, () => {
      expect(indexCss).toContain(`.dark[data-theme="${palette}"]`);
    });

    it(`defines --background variable for ${palette}`, () => {
      // Check that the palette block actually sets core vars
      const lightBlock = indexCss.indexOf(`[data-theme="${palette}"]`);
      const darkBlock = indexCss.indexOf(`.dark[data-theme="${palette}"]`);
      expect(lightBlock).toBeGreaterThan(-1);
      expect(darkBlock).toBeGreaterThan(-1);
      // Both blocks should come after the default :root block
      const rootBlock = indexCss.indexOf(':root {');
      expect(lightBlock).toBeGreaterThan(rootBlock);
      expect(darkBlock).toBeGreaterThan(rootBlock);
    });
  }
});
