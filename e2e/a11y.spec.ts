import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = [
  { name: 'homepage',   path: '/' },
  { name: 'blog index', path: '/blog' },
  { name: 'blog post',  path: '/blog/2026-01-30-processes-abstraction' },
];

for (const { name, path } of PAGES) {
  test(`${name} — no critical/serious a11y violations`, async ({ page }) => {
    test.slow();
    await page.goto(path);
    // Wait for the React navbar island to hydrate before scanning
    await page.locator('select[aria-label="Select colour theme"]').waitFor({ state: 'visible' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#astro-dev-overlay')
      .analyze();

    const blocking = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious',
    );

    const detail = blocking
      .map(v => `[${v.impact}] ${v.id}: ${v.description}\n  ${v.nodes.map(n => n.html).join('\n  ')}`)
      .join('\n\n');
    expect(blocking, `a11y violations on "${name}":\n\n${detail}`).toHaveLength(0);
  });
}

test('blog post dark mode — no new violations', async ({ page }) => {
  test.slow();
  await page.goto('/blog/2026-01-30-processes-abstraction');
  await page.locator('select[aria-label="Select colour theme"]').waitFor({ state: 'visible' });
  await page.getByLabel('Toggle theme').click();
  await expect(page.locator('html')).toHaveClass(/dark/);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .exclude('#astro-dev-overlay')
    .analyze();

  const blocking = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  expect(blocking, blocking.map(v => v.description).join(', ')).toHaveLength(0);
});
