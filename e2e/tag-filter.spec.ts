import { test, expect } from '@playwright/test';

// Tag used as E2E fixture:
//   'gsoc' appears on 4 posts (all gsoc posts) but NOT on lsp or processes-abstraction posts.
//   This means filtering by 'gsoc' removes at least one visible post, verifying the filter works.
const FILTER_TAG = 'gsoc';
const POST_WITH_TAG_TITLE = "GSoC'21: Irdest Android Client – Overview";
const POST_WITHOUT_TAG_TITLE = 'Processes - Abstraction';
const POST_SLUG_WITH_TAG = '2021-06-07-gsoc21-irdest-android-intro';

test.describe('Tag filter', () => {
  test('navigating to /blog?tag=gsoc applies filter on load', async ({ page }) => {
    await page.goto(`/blog?tag=${FILTER_TAG}`);
    await page.waitForLoadState('networkidle');

    // At least one post card with the tag should be visible
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible({ timeout: 10_000 });

    // A post without the 'gsoc' tag should NOT be in the DOM
    await expect(page.getByText(POST_WITHOUT_TAG_TITLE)).not.toBeVisible();

    // The clear button should be present since a filter is active
    await expect(page.getByText('clear')).toBeVisible();
  });

  test('clicking a tag in the blog list updates URL to ?tag=<name>', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Wait for the React island to hydrate — tag buttons appear after hydration
    const tagButton = page.getByRole('button', { name: FILTER_TAG }).first();
    await expect(tagButton).toBeVisible({ timeout: 10_000 });

    await tagButton.click();

    // URL should now contain ?tag=gsoc
    await expect(page).toHaveURL(/\/blog\?tag=gsoc/);

    // Only posts with the gsoc tag should be visible
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible();

    // Post without the tag should be hidden
    await expect(page.getByText(POST_WITHOUT_TAG_TITLE)).not.toBeVisible();
  });

  test('clicking clear removes the filter and clears the URL param', async ({ page }) => {
    await page.goto(`/blog?tag=${FILTER_TAG}`);
    await page.waitForLoadState('networkidle');

    // Wait for clear button (hydration confirmation)
    const clearBtn = page.getByText('clear');
    await expect(clearBtn).toBeVisible({ timeout: 10_000 });

    const filteredCount = await page.locator('article').count();

    await clearBtn.click();

    // URL should no longer contain ?tag=
    await expect(page).not.toHaveURL(/tag=/);

    // More posts should now be visible (filter removed)
    const allCount = await page.locator('article').count();
    expect(allCount).toBeGreaterThan(filteredCount);

    // Previously hidden post should now be visible
    await expect(page.getByText(POST_WITHOUT_TAG_TITLE)).toBeVisible();
  });

  test('clicking a tag on a blog post page navigates to filtered blog list', async ({ page }) => {
    await page.goto(`/blog/${POST_SLUG_WITH_TAG}`);
    await page.waitForLoadState('networkidle');

    // Click a tag link in the post meta area
    const tagLink = page.locator('header a', { hasText: FILTER_TAG }).first();
    await expect(tagLink).toBeVisible({ timeout: 10_000 });
    await tagLink.click();

    // Should navigate to the filtered blog list
    await page.waitForURL(/\/blog\?tag=gsoc/);
    await page.waitForLoadState('networkidle');

    // The blog list should show only filtered results
    const articles = page.locator('article');
    await expect(articles.first()).toBeVisible({ timeout: 10_000 });

    // Post without the gsoc tag should not be visible
    await expect(page.getByText(POST_WITHOUT_TAG_TITLE)).not.toBeVisible();
  });
});
