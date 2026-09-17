import { test, expect } from '@playwright/test';

test.describe('production build smoke', () => {
  test('serves the built app under the base path with all assets', async ({ page }) => {
    const consoleErrors: string[] = [];
    const failedRequests: string[] = [];
    const badResponses: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));
    page.on('requestfailed', (request) => {
      failedRequests.push(`${request.url()} — ${request.failure()?.errorText ?? 'unknown'}`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`);
    });

    await page.goto('/');
    await expect(page).toHaveURL(/\/web-playground\/$/);

    await expect(page).toHaveTitle('Trazire Mart');
    await expect(page.locator('[data-testid="home-view"]')).toBeVisible();
    await page.locator('[data-testid="start-shopping-btn"]').click();
    await expect(page).toHaveURL(/#\/shop$/);

    await expect(page.locator('[data-testid^="product-card-"]')).toHaveCount(6);

    const images = page.locator('[data-testid^="product-image-"]');
    await expect(images).toHaveCount(6);
    await expect
      .poll(() =>
        images.evaluateAll((imgs) =>
          imgs.every((img) => {
            const element = img as HTMLImageElement;
            return element.complete && element.naturalWidth > 0;
          })
        )
      )
      .toBe(true);

    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');

    expect.soft(consoleErrors, 'console errors').toEqual([]);
    expect.soft(failedRequests, 'failed requests').toEqual([]);
    expect.soft(badResponses, 'responses with status >= 400').toEqual([]);
  });
});
