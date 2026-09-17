import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ProductGridPage } from '../e2e/pages/ProductGridPage';
import { CartModalPage } from '../e2e/pages/CartModalPage';
import { CheckoutPage } from '../e2e/pages/CheckoutPage';
import { validShipping } from '../e2e/helpers/test-data';

test.describe('Accessibility Audits', () => {
  test.describe.configure({ mode: 'serial' });

  test('homepage — no critical or serious a11y violations', { tag: '@products' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await products.expectVisible();

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('cart modal — no critical or serious a11y violations', { tag: '@cart' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await products.addToCart(2);
    await cart.open();
    await cart.expectItemVisible(1);

    const results = await new AxeBuilder({ page })
      .include('[data-testid="cart-modal"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('checkout shipping form — no critical or serious a11y violations', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const checkout = new CheckoutPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await checkout.expectShippingStep();

    const results = await new AxeBuilder({ page })
      .include('[data-testid="checkout-form"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('checkout payment form — no critical or serious a11y violations', { tag: '@checkout' }, async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const checkout = new CheckoutPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await checkout.fillShipping(validShipping);
    await checkout.expectPaymentStep();

    const results = await new AxeBuilder({ page })
      .include('[data-testid="checkout-form"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });
});
