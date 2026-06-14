import { test, expect } from '@playwright/test';

test.describe('Product Grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the product grid section', async ({ page }) => {
    const grid = page.locator('[data-testid="product-grid"]');
    await expect(grid).toBeVisible();
  });

  test('should display at least one product card', async ({ page }) => {
    const cards = page.locator('[data-testid^="product-card-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('each product card should display name, price, image, and add-to-cart button', async ({ page }) => {
    const cards = page.locator('[data-testid^="product-card-"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);

      await expect(
        card.locator('[data-testid*="product-name"]')
      ).toBeVisible();

      await expect(
        card.locator('[data-testid*="product-price"]')
      ).toBeVisible();

      await expect(
        card.locator('[data-testid*="product-image"]')
      ).toBeVisible();

      await expect(
        card.locator('[data-testid*="add-to-cart-btn"]')
      ).toBeVisible();
    }
  });

  test('add-to-cart buttons should be enabled for every product', async ({ page }) => {
    const buttons = page.locator('[data-testid*="add-to-cart-btn"]');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeEnabled();
    }
  });
});
