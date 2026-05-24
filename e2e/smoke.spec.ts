import { test, expect } from '@playwright/test';

test.describe('Site smoke tests', () => {
  test('homepage loads with navbar and site title', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('systems & writing')).toBeVisible();
    // Use nav-scoped locators to avoid ambiguity with page body text
    const nav = page.locator('nav');
    await expect(nav.getByText('about')).toBeVisible();
    await expect(nav.getByText('blog')).toBeVisible();
  });

  test('blog index lists posts with human-readable dates', async ({ page }) => {
    await page.goto('/blog');
    // Should have at least one blog post card
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();

    // Dates should be in ordinal format, not ISO
    const pageText = await page.textContent('body');
    expect(pageText).toMatch(/\d{1,2}(st|nd|rd|th)\s\w+\s\d{4}/);
  });

  test('blog post page renders content and metadata', async ({ page }) => {
    await page.goto('/blog/2026-01-30-processes-abstraction');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText('← all posts')).toBeVisible();
    await expect(page.locator('article.prose')).toBeVisible();
  });

  test('code blocks have syntax highlighting (Shiki)', async ({ page }) => {
    // This post has code blocks with language annotations
    await page.goto('/blog/2021-07-12-gitlab-android-ci');
    // Shiki renders pre with data-language attribute
    const codeBlock = page.locator('pre[data-language]').first();
    await expect(codeBlock).toBeVisible({ timeout: 10_000 });
  });

  test('404 page renders', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
  });
});
