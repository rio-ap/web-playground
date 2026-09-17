import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HomePage } from '../e2e/pages/HomePage';
import { ProductGridPage } from '../e2e/pages/ProductGridPage';
import { CartModalPage } from '../e2e/pages/CartModalPage';
import { CheckoutAddressPage } from '../e2e/pages/CheckoutAddressPage';
import { CheckoutPaymentPage } from '../e2e/pages/CheckoutPaymentPage';
import { CheckoutReviewPage } from '../e2e/pages/CheckoutReviewPage';
import { ConfirmationPage } from '../e2e/pages/ConfirmationPage';
import { validShipping, validPayment } from '../e2e/helpers/test-data';

async function expectNoViolations(page: Page, selector?: string): Promise<void> {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
  if (selector) builder.include(selector);

  const results = await builder.analyze();
  expect(results.violations).toEqual([]);
}

test.describe('Accessibility Audits', () => {
  test.describe.configure({ mode: 'serial' });

  test('home — no critical or serious a11y violations', { tag: '@home' }, async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectWelcome();

    await expectNoViolations(page);
  });

  test('shop catalog — no critical or serious a11y violations', { tag: '@shop' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await products.expectVisible();

    await expectNoViolations(page);
  });

  test('cart modal — no critical or serious a11y violations', { tag: '@cart' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await products.addToCart(2);
    await cart.open();
    await cart.expectItemVisible(1);

    await expectNoViolations(page, '[data-testid="cart-modal"]');
  });

  test('checkout address — no critical or serious a11y violations', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();

    await expectNoViolations(page, '[data-testid="checkout-address-page"]');
  });

  test('checkout payment — no critical or serious a11y violations', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const address = new CheckoutAddressPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await address.submit(validShipping);

    await expectNoViolations(page, '[data-testid="checkout-payment-page"]');
  });

  test('checkout review — no critical or serious a11y violations', { tag: '@checkout' }, async ({ page }) => {
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

    await expectNoViolations(page, '[data-testid="checkout-review-page"]');
  });

  test('order confirmation — no critical or serious a11y violations', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    const review = new CheckoutReviewPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await address.submit(validShipping);
    await payment.submit(validPayment);
    await review.placeOrder();

    await expectNoViolations(page, '[data-testid="confirmation-page"]');
  });
});
