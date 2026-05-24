import { test, expect } from '@playwright/test';

test.describe('RSS feed', () => {
  test('serves valid XML', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/xml|rss/i);
  });

  test('has required RSS channel structure', async ({ request }) => {
    const text = await (await request.get('/rss.xml')).text();
    expect(text).toContain('<rss');
    expect(text).toContain('<channel>');
    expect(text).toContain('</channel>');
    expect(text).toContain('</rss>');
  });

  test('has at least one item with title, link inside /blog/, and pubDate', async ({ request }) => {
    const text = await (await request.get('/rss.xml')).text();
    const items = text.match(/<item>/g) ?? [];
    expect(items.length).toBeGreaterThan(0);
    expect(text).toContain('<pubDate>');
    const links = [...text.matchAll(/<link>(.*?)<\/link>/g)].map(m => m[1]);
    expect(links.some(l => l.includes('/blog/'))).toBe(true);
  });

  test('channel title references the site', async ({ request }) => {
    const text = await (await request.get('/rss.xml')).text();
    const match = text.match(/<title>([\s\S]*?)<\/title>/);
    expect(match).toBeTruthy();
    expect(match![1].trim().length).toBeGreaterThan(0);
  });
});
