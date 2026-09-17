import { test } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';
import { CartModalPage } from './pages/CartModalPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { validShipping, validPayment } from './helpers/test-data';

test.describe('Checkout Flow', { tag: '@checkout' }, () => {
  test.beforeEach(async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
  });

  test('should display the shipping info form', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.expectShippingStep();
  });

  test('should show validation errors when shipping form is submitted empty', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.expectShippingErrors();
  });

  test('should allow cancel back to cart from shipping', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    const cart = new CartModalPage(page);
    await checkout.cancel();
    await cart.expectModalVisible();
  });

  test('should proceed to payment after valid shipping info', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShipping(validShipping);
    await checkout.expectPaymentStep();
  });

  test('should show validation errors when payment form is submitted empty', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShipping(validShipping);
    await checkout.expectPaymentErrors();
  });

  test('should go back to shipping from payment', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShipping(validShipping);
    await checkout.goBack();
    await checkout.expectShippingStep();
  });

  test('should complete full checkout flow and show order confirmation', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShipping(validShipping);
    await checkout.fillPayment(validPayment);
    await checkout.expectOrderConfirmed();
  });

  test('should clear cart and return to products after continue shopping', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    const cart = new CartModalPage(page);
    const products = new ProductGridPage(page);
    await checkout.fillShipping(validShipping);
    await checkout.fillPayment(validPayment);
    await checkout.continueShopping();
    await cart.expectBadgeHidden();
    await products.expectVisible();
  });
});
