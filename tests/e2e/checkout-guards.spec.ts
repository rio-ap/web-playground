import { test, expect, type Page } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';
import { CartModalPage } from './pages/CartModalPage';
import { CheckoutAddressPage } from './pages/CheckoutAddressPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { CheckoutReviewPage } from './pages/CheckoutReviewPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { validShipping, validPayment } from './helpers/test-data';

const setHash = (page: Page, hash: string) =>
  page.evaluate((value) => {
    window.location.hash = value;
  }, hash);

test.describe('Checkout Route Guards', { tag: '@checkout' }, () => {
  test('should redirect the bare checkout route to the address page', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await products.addToCart(1);

    await setHash(page, '#/checkout');

    await expect(page).toHaveURL(/#\/checkout\/address$/);
    await new CheckoutAddressPage(page).expectVisible();
  });

  test('should redirect the address page to the shop when the cart is empty', async ({ page }) => {
    await page.goto('/#/checkout/address');

    await expect(page).toHaveURL(/#\/shop$/);
  });

  test('should redirect the payment page to the shop when the cart is empty', async ({ page }) => {
    await page.goto('/#/checkout/payment');

    await expect(page).toHaveURL(/#\/shop$/);
  });

  test('should redirect the payment page to the address page when shipping is missing', async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
    await products.addToCart(1);

    await setHash(page, '#/checkout/payment');

    await expect(page).toHaveURL(/#\/checkout\/address$/);
  });

  test('should redirect the review page to payment when payment is missing', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    const address = new CheckoutAddressPage(page);
    await products.goto();
    await products.addToCart(1);
    await cart.open();
    await cart.checkout();
    await address.submit(validShipping);

    await setHash(page, '#/checkout/review');

    await expect(page).toHaveURL(/#\/checkout\/payment$/);
  });

  test('should redirect the confirmation page home when there is no order', async ({ page }) => {
    await page.goto('/#/confirmation');

    await expect(page).toHaveURL(/#\/$/);
  });

  test('should require the address step again for a new checkout after ordering', async ({ page }) => {
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

    await setHash(page, '#/shop');
    await products.addToCart(2);
    await setHash(page, '#/checkout/review');

    await expect(page).toHaveURL(/#\/checkout\/address$/);
    await address.expectVisible();
  });

  test('should return to the shop when placing an order with an empty cart', async ({ page }) => {
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

    await cart.open();
    await cart.removeItem(1);
    await cart.close();
    await review.placeOrderBtn.click();

    await expect(page).toHaveURL(/#\/shop$/);
  });
});
