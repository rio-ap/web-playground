import { test, expect } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';
import { CartModalPage } from './pages/CartModalPage';
import { CheckoutAddressPage } from './pages/CheckoutAddressPage';
import { CheckoutPaymentPage } from './pages/CheckoutPaymentPage';
import { CheckoutReviewPage } from './pages/CheckoutReviewPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
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

  test('should open the shipping address page on the first step', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    await address.expectVisible();
    await address.expectStepActive('address');
  });

  test('should show validation errors when the address is submitted empty', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    await address.continueBtn.click();
    await address.expectErrors();
    await expect(page).toHaveURL(/#\/checkout\/address$/);
  });

  test('should reject an invalid email and a non-numeric zip', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    await address.fill({ ...validShipping, email: 'not-an-email', zip: '12a45' });
    await address.continueBtn.click();
    await expect(page).toHaveURL(/#\/checkout\/address$/);
    await expect(address.emailError).toBeVisible();
    await expect(address.zipError).toBeVisible();
  });

  test('should proceed to the payment page after valid shipping info', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    await address.submit(validShipping);
    await payment.expectVisible();
    await payment.expectStepActive('payment');
  });

  test('should show validation errors when payment is submitted empty', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    await address.submit(validShipping);
    await payment.reviewBtn.click();
    await payment.expectErrors();
    await expect(page).toHaveURL(/#\/checkout\/payment$/);
  });

  test('should reject an out-of-range expiry month', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    await address.submit(validShipping);
    await payment.fill({ ...validPayment, expiry: '1328' });
    await payment.reviewBtn.click();
    await expect(page).toHaveURL(/#\/checkout\/payment$/);
    await expect(payment.expiryError).toBeVisible();
  });

  test('should format the card number and expiry while typing', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    await address.submit(validShipping);

    await payment.cardInput.fill('4242424242424242');
    await expect(payment.cardInput).toHaveValue('4242 4242 4242 4242');
    await expect(payment.cardBrand).toHaveText('VISA');
    await expect(payment.cardBrand).not.toHaveClass(/hidden/);

    await payment.cardInput.fill('378282246310005');
    await expect(payment.cardInput).toHaveValue('3782 822463 10005');
    await expect(payment.cardBrand).toHaveText('AMEX');

    await payment.expiryInput.fill('1228');
    await expect(payment.expiryInput).toHaveValue('12/28');

    await payment.expiryInput.fill('12/2028');
    await expect(payment.expiryInput).toHaveValue('12/28');
  });

  test('should keep the caret steady while editing the card number', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    await address.submit(validShipping);

    await payment.cardInput.fill('4242424242424242');
    await payment.cardInput.evaluate((el) => {
      const input = el as HTMLInputElement;
      input.focus();
      input.setSelectionRange(4, 4);
    });
    await page.keyboard.type('9');

    await expect(payment.cardInput).toHaveValue('4242 9424 2424 2424');
    expect(await payment.cardInput.evaluate((el) => (el as HTMLInputElement).selectionStart)).toBe(6);
  });

  test('should accept an amex card through to review', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    const review = new CheckoutReviewPage(page);
    await address.submit(validShipping);
    await payment.cardInput.fill('378282246310005');
    await payment.expiryInput.fill('12/28');
    await payment.cvvInput.fill('1234');
    await payment.review();

    await expect(review.paymentBlock).toContainText('Amex ending 0005');
  });

  test('should review the shipping, payment and item details', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    const review = new CheckoutReviewPage(page);
    await address.submit(validShipping);
    await payment.submit(validPayment);

    await review.expectVisible();
    await review.expectStepActive('review');
    await expect(review.shippingBlock).toContainText(validShipping.name);
    await expect(review.shippingBlock).toContainText(validShipping.address);
    await expect(review.paymentBlock).toContainText('Visa ending 1111');
    await expect(review.paymentBlock).toContainText('expires 12/28');
    await expect(review.itemsBlock).toContainText('Wireless Headphones');
    await expect(review.total).toHaveText('$79.99');
  });

  test('should complete the order and clear the cart badge', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    const review = new CheckoutReviewPage(page);
    const confirmation = new ConfirmationPage(page);
    await address.submit(validShipping);
    await payment.submit(validPayment);
    await review.placeOrder();

    await confirmation.expectConfirmed();
    await expect(confirmation.orderNumber).toHaveText(/^ORD-/);
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveClass(/hidden/);
  });

  test('should return to the shop after continue shopping', async ({ page }) => {
    const address = new CheckoutAddressPage(page);
    const payment = new CheckoutPaymentPage(page);
    const review = new CheckoutReviewPage(page);
    const confirmation = new ConfirmationPage(page);
    const products = new ProductGridPage(page);
    await address.submit(validShipping);
    await payment.submit(validPayment);
    await review.placeOrder();
    await confirmation.continueShopping();

    await products.expectVisible();
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveClass(/hidden/);
  });
});
