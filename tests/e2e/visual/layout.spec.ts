import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductGridPage } from '../pages/ProductGridPage';
import { CartModalPage } from '../pages/CartModalPage';
import { CheckoutAddressPage } from '../pages/CheckoutAddressPage';
import { CheckoutPaymentPage } from '../pages/CheckoutPaymentPage';
import { CheckoutReviewPage } from '../pages/CheckoutReviewPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
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

  test('home — full page baseline', { tag: '@home' }, async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectWelcome();
    await expect(page).toHaveScreenshot('home.png', { fullPage: true, timeout: 30000 });
  });

  test('product grid — full page baseline', { tag: '@shop' }, async ({ page }) => {
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

  test('checkout address — full page baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await new CheckoutAddressPage(page).expectVisible();
    await expect(page).toHaveScreenshot('checkout-address-full-page.png', { fullPage: true, timeout: 30000 });
  });

  test('checkout payment — full page baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const address = new CheckoutAddressPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await address.submit(validShipping);
    await new CheckoutPaymentPage(page).expectVisible();
    await expect(page).toHaveScreenshot('checkout-payment-full-page.png', { fullPage: true, timeout: 30000 });
  });

  test('checkout review — full page baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await address.submit(validShipping);
    await payment.submit(validPayment);
    await new CheckoutReviewPage(page).expectVisible();
    await expect(page).toHaveScreenshot('checkout-review-full-page.png', { fullPage: true, timeout: 30000 });
  });

  test('confirmation — full page baseline', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    const review = new CheckoutReviewPage(page);
    const confirmation = new ConfirmationPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await address.submit(validShipping);
    await payment.submit(validPayment);
    await review.placeOrder();
    await confirmation.expectConfirmed();
    await expect(page).toHaveScreenshot('confirmation-full-page.png', {
      fullPage: true,
      timeout: 30000,
      mask: [confirmation.orderNumber],
      maskColor: '#000000',
    });
  });
});
