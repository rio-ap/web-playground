import { test, expect } from '@playwright/test';
import { ProductGridPage } from '../pages/ProductGridPage';
import { CartModalPage } from '../pages/CartModalPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { validShipping, validPayment } from '../helpers/test-data';

test.describe('Visual Regression', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent =
          '[data-testid="toast"]{display:none !important}body > img[data-testid^="product-image-"]{display:none !important}';
        document.head.appendChild(style);
      });
    });
  });

  test('product grid — full page baseline', { tag: '@products' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await products.expectVisible();
    await expect(page).toHaveScreenshot('product-grid-full-page.png', { fullPage: true, timeout: 30000 });
  });

  test('cart modal — with two items baseline', { tag: '@cart' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await products.addToCart(2);
    await cart.open();
    await cart.expectItemVisible(1);
    await cart.expectItemVisible(2);
    await expect(page.locator('[data-testid="cart-modal"]')).toHaveScreenshot('cart-modal-with-items.png');
  });

  test('checkout — shipping step baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await expect(page.locator('[data-testid="checkout-form"]')).toHaveScreenshot('checkout-shipping.png');
  });

  test('checkout — payment step baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const checkout = new CheckoutPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await checkout.fillShipping(validShipping);
    await checkout.expectPaymentStep();
    await expect(page.locator('[data-testid="checkout-form"]')).toHaveScreenshot('checkout-payment.png');
  });

  test('checkout — order confirmation baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const checkout = new CheckoutPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await checkout.fillShipping(validShipping);
    await checkout.fillPayment(validPayment);
    await checkout.expectOrderConfirmed();
    await expect(page.locator('[data-testid="checkout-form"]')).toHaveScreenshot('order-confirmation.png', {
      mask: [page.locator('[data-testid="order-number"]')],
      maskColor: '#000000',
    });
  });
});
