import { test, expect } from '@playwright/test';

/**
 * Wait for the Navbar React island to fully hydrate.
 * The select is React-controlled — once it has a value, React has mounted.
 */
async function waitForNavbar(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
  const select = page.getByLabel('Select colour theme');
  await expect(select).toBeVisible({ timeout: 10_000 });
  await expect(select).toHaveValue('rose-pine', { timeout: 5_000 });
}

test.describe('Theme switching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    });
    await page.reload();
    await waitForNavbar(page);
  });

  test('dark mode toggle adds and removes .dark class', async ({ page }) => {
    const toggle = page.getByLabel('Toggle theme');
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 3_000 });

    await toggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/, { timeout: 3_000 });
  });

  test('dark mode persists across page reload', async ({ page }) => {
    const toggle = page.getByLabel('Toggle theme');
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 3_000 });

    await page.reload();
    // FOUC script restores dark class before paint
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('palette dropdown sets data-theme attribute', async ({ page }) => {
    await page.getByLabel('Select colour theme').selectOption('nord');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'nord');
  });

  test('palette persists across page reload', async ({ page }) => {
    await page.getByLabel('Select colour theme').selectOption('gruvbox');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'gruvbox');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'gruvbox');
  });

  test('palette and dark mode coexist', async ({ page }) => {
    await page.getByLabel('Select colour theme').selectOption('rose-pine');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose-pine');

    await page.getByLabel('Toggle theme').click();
    await expect(page.locator('html')).toHaveClass(/dark/, { timeout: 3_000 });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose-pine');

    // Reload — both should persist
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose-pine');
  });

  test('rose-pine palette is active by default with empty localStorage', async ({ page }) => {
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose-pine');
    await expect(page.getByLabel('Select colour theme')).toHaveValue('rose-pine');
  });

  test('Default option no longer appears in palette dropdown', async ({ page }) => {
    const select = page.getByLabel('Select colour theme');
    const options = await select.locator('option').allTextContents();
    expect(options).not.toContain('Default');
  });

  test('fresh visitor gets rose-pine as active palette', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'rose-pine');
    await expect(page.getByLabel('Select colour theme')).toHaveValue('rose-pine');
  });
});
