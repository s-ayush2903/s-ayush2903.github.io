import { test, expect } from '@playwright/test';
import { SITE_NAME } from '../src/lib/constants';

async function ogContent(page: import('@playwright/test').Page, property: string) {
  return page.locator(`meta[property="${property}"]`).getAttribute('content');
}

test.describe('page metadata', () => {
  test('homepage — title and OG tags', async ({ page }) => {
    await page.goto('/');
    expect(await page.title()).toBe(SITE_NAME);
    expect(await ogContent(page, 'og:title')).toBe(SITE_NAME);
    expect(await ogContent(page, 'og:type')).toBe('website');
    expect(await ogContent(page, 'og:image')).toBeTruthy();
    expect(await ogContent(page, 'og:image:alt')).toContain(SITE_NAME);
  });

  test('blog index — title contains site name', async ({ page }) => {
    await page.goto('/blog');
    const title = await page.title();
    expect(title).toContain(SITE_NAME);
    expect(title).toContain('writing');
  });

  test('blog post — title, OG article type, published_time', async ({ page }) => {
    await page.goto('/blog/2026-01-30-processes-abstraction');
    const title = await page.title();
    // Should be "Post Title · systems & writing"
    expect(title).toContain(SITE_NAME);
    expect(title).not.toBe(SITE_NAME);
    expect(await ogContent(page, 'og:type')).toBe('article');
    expect(await ogContent(page, 'og:title')).toBeTruthy();
    expect(typeof await ogContent(page, 'og:description')).toBe('string');
    expect(await ogContent(page, 'article:published_time')).toBeTruthy();
  });

  test('404 page has a non-empty title', async ({ page }) => {
    await page.goto('/does-not-exist');
    expect((await page.title()).length).toBeGreaterThan(0);
  });
});
