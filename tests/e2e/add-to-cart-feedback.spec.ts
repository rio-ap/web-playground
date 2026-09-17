import { test, expect } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';

const TOAST = '[data-testid="toast"]';
const FLYING_IMAGE = 'body > img[data-testid="product-image-1"]';

test.describe('Add-to-cart feedback', () => {
  test('flies the product image to the cart and shows a toast with the product name', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await products.addToCart(1);

    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
    await expect(page.locator(FLYING_IMAGE)).toHaveCount(1);
    await expect(page.locator(FLYING_IMAGE)).toHaveCount(0, { timeout: 3000 });

    const toast = page.locator(TOAST);
    await expect(toast).toHaveText('Wireless Headphones added to cart');
    await expect.poll(() => toast.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    await expect
      .poll(() => toast.evaluate((el) => getComputedStyle(el).opacity), { timeout: 5000 })
      .toBe('0');
  });

  test.describe('prefers-reduced-motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('still updates the badge and shows the toast without animations', async ({ page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      const products = new ProductGridPage(page);
      await products.goto();
      await products.addToCart(1);

      await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
      await expect(page.locator(FLYING_IMAGE)).toHaveCount(0);
      await expect(page.locator(TOAST)).toHaveText('Wireless Headphones added to cart');
      await expect
        .poll(() => page.locator(TOAST).evaluate((el) => getComputedStyle(el).opacity))
        .toBe('1');
      expect(errors).toEqual([]);
    });
  });
});
