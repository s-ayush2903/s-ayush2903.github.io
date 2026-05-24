import { test, expect } from '@playwright/test';

test.describe('Favicon', () => {
  test('favicon.svg is served and is valid SVG', async ({ request }) => {
    const res = await request.get('/favicon.svg');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('image/svg');
    const text = await res.text();
    expect(text).toContain('<svg');
  });

  test('no stale favicon.ico present', async ({ request }) => {
    const res = await request.get('/favicon.ico');
    expect(res.status()).toBe(404);
  });
});

test.describe('OG image', () => {
  test('homepage has og:image meta tag pointing to /og.png', async ({ page }) => {
    await page.goto('/');
    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveAttribute('content', /\/og\.png$/);
  });

  test('og.svg uses JetBrains Mono, not IBM Plex', async ({ page }) => {
    const response = await page.goto('/og.svg');
    expect(response?.status()).toBe(200);
    const body = await response!.text();
    expect(body).toContain('JetBrains Mono');
    expect(body).not.toContain('IBM Plex');
  });

  test('og.png is reachable and is the correct 1200x630 size', async ({ page }) => {
    const response = await page.goto('/og.png');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['content-type']).toContain('image/png');

    // Render it and measure intrinsic dimensions
    const dimensions = await page.evaluate(() => {
      return new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = '/og.png';
      });
    });
    expect(dimensions.width).toBe(1200);
    expect(dimensions.height).toBe(630);
  });
});
