import { test, expect } from '@playwright/test';

const SEED_PAGES = ['/', '/blog', '/blog/2026-01-30-processes-abstraction'];

async function internalHrefs(page: import('@playwright/test').Page): Promise<string[]> {
  const hrefs = await page.locator('a[href]').evaluateAll(
    els => els.map(el => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
  );
  return [...new Set(
    hrefs
      .filter(h => h.startsWith('/') && !h.startsWith('//'))
      .filter(h => !h.includes('rss.xml')), // tested separately
  )];
}

test.describe('internal link integrity', () => {
  test('no 404s reachable from seed pages', async ({ page }) => {
    const visited = new Set<string>();
    const toCheck = new Set<string>(SEED_PAGES);

    for (const href of toCheck) {
      if (visited.has(href)) continue;
      visited.add(href);

      const response = await page.goto(href);
      expect(
        response?.status(),
        `${href} returned ${response?.status()}`,
      ).not.toBe(404);

      for (const link of await internalHrefs(page)) {
        if (!visited.has(link)) toCheck.add(link);
      }
    }
  });

  test('blog post cards link to /blog/ not /posts/', async ({ page }) => {
    await page.goto('/blog');
    const hrefs = await page.locator('article a[href]').evaluateAll(
      els => els.map(el => (el as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href, `bad prefix: ${href}`).not.toMatch(/^\/posts\//);
      expect(href, `expected /blog/ prefix: ${href}`).toMatch(/^\/blog\//);
    }
  });
});
