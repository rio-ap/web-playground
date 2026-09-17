import { test, expect, type Page } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';

const TOAST = '[data-testid="toast"]';

declare global {
  interface Window {
    __toastShows: string[];
    __flyInserts: number;
    __flyRemovals: number;
    __reduceAtLoad: boolean;
  }
}

async function recordFeedback(page: Page) {
  await page.evaluate(() => {
    window.__toastShows = [];
    window.__flyInserts = 0;
    window.__flyRemovals = 0;
    window.__reduceAtLoad = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const toast = document.querySelector('[data-testid="toast"]');
    new MutationObserver(() => {
      if (toast.textContent) window.__toastShows.push(toast.textContent);
    }).observe(toast, { childList: true, characterData: true, subtree: true });

    const isFlyingImage = (node: Node) =>
      node instanceof HTMLImageElement && (node.dataset.testid ?? '').startsWith('product-image-');

    new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (isFlyingImage(node)) window.__flyInserts++;
        }
        for (const node of mutation.removedNodes) {
          if (isFlyingImage(node)) window.__flyRemovals++;
        }
      }
    }).observe(document.body, { childList: true });
  });
}

test.describe('Add-to-cart feedback', () => {
  test('flies the product image to the cart and shows a toast with the product name', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await recordFeedback(page);

    await products.addToCart(1);

    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
    await expect
      .poll(() => page.evaluate(() => window.__flyInserts), { timeout: 10000 })
      .toBeGreaterThan(0);
    await expect
      .poll(() => page.evaluate(() => window.__flyRemovals), { timeout: 10000 })
      .toBeGreaterThan(0);

    const toast = page.locator(TOAST);
    await expect(toast).toHaveText('Wireless Headphones added to cart');
    await expect
      .poll(() => page.evaluate(() => window.__toastShows.at(-1)), { timeout: 10000 })
      .toBe('Wireless Headphones added to cart');
    await expect
      .poll(() => toast.evaluate((el) => getComputedStyle(el).opacity), { timeout: 10000 })
      .toBe('0');
  });

  test.describe('prefers-reduced-motion', () => {
    test('still updates the badge and shows the toast without animations', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });

      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', (error) => errors.push(error.message));

      const products = new ProductGridPage(page);
      await products.goto();
      await recordFeedback(page);
      expect(
        await page.evaluate(() => window.__reduceAtLoad),
        'reduced-motion emulation must be active before clicking'
      ).toBe(true);

      await products.addToCart(1);

      await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');
      await expect(page.locator(TOAST)).toHaveText('Wireless Headphones added to cart');
      await expect
        .poll(() => page.evaluate(() => window.__toastShows.at(-1)), { timeout: 10000 })
        .toBe('Wireless Headphones added to cart');

      const flies = await page.evaluate(() => ({
        inserts: window.__flyInserts,
        removals: window.__flyRemovals,
      }));
      expect(flies.inserts, JSON.stringify(flies)).toBe(0);
      expect(flies.removals).toBe(0);
      expect(errors).toEqual([]);
    });
  });
});
