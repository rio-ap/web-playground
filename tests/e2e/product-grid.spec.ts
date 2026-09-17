import { test } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';

test.describe('Product Grid', { tag: '@products' }, () => {
  test.beforeEach(async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
  });

  test('should display the product grid section', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.expectVisible();
  });

  test('should display at least one product card', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.expectAtLeastOneProduct();
  });

  test('each product card should display name, price, image, and add-to-cart button', async ({ page }) => {
    const products = new ProductGridPage(page);
    const count = await products.getCardCount();

    for (let i = 1; i <= count; i++) {
      await products.expectProductCardVisible(i);
    }
  });

  test('add-to-cart buttons should be enabled for every product', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.expectAllAddToCartButtonsEnabled();
  });
});
