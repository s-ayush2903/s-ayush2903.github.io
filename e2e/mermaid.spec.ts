import { test, expect } from '@playwright/test';

test.describe('Mermaid diagram rendering', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the blog post that has mermaid diagrams
    await page.goto('/blog/2026-01-30-processes-abstraction');
    // Wait for MermaidIsland (client:idle) to hydrate and render
    await page.waitForSelector('[data-mermaid-source]', { timeout: 15_000 });
  });

  test('replaces all raw mermaid code blocks with rendered SVGs', async ({ page }) => {
    // No raw mermaid pre blocks should remain
    const rawBlocks = page.locator('pre[data-language="mermaid"]');
    await expect(rawBlocks).toHaveCount(0);

    // Rendered containers should exist (this post has 2 diagrams)
    const containers = page.locator('[data-mermaid-source]');
    await expect(containers).toHaveCount(2);

    // Each container should have an SVG inside
    for (let i = 0; i < 2; i++) {
      const svg = containers.nth(i).locator('svg');
      await expect(svg).toBeVisible();
    }
  });

  test('mermaid SVGs contain actual diagram content (not empty)', async ({ page }) => {
    const svgs = page.locator('[data-mermaid-source] svg');
    const count = await svgs.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const bbox = await svgs.nth(i).boundingBox();
      expect(bbox).not.toBeNull();
      // SVG should have meaningful dimensions (not 0×0)
      expect(bbox!.width).toBeGreaterThan(50);
      expect(bbox!.height).toBeGreaterThan(50);
    }
  });

  test('preserves diagram source in data attribute for re-rendering', async ({ page }) => {
    const containers = page.locator('[data-mermaid-source]');
    const count = await containers.count();

    for (let i = 0; i < count; i++) {
      const source = await containers.nth(i).getAttribute('data-mermaid-source');
      expect(source).toBeTruthy();
      expect(source!.length).toBeGreaterThan(10);
    }
  });
});
