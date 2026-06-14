import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await page.locator('[data-testid="checkout-btn"]').click();
  });

  test('should display the shipping info form', async ({ page }) => {
    await expect(page.locator('[data-testid="checkout-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Shipping Info');
    await expect(page.locator('[data-testid="shipping-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-city-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-zip-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-email-input"]')).toBeVisible();
  });

  test('should show validation errors when shipping form is submitted empty', async ({ page }) => {
    await page.locator('[data-testid="checkout-next-btn"]').click();
    await expect(page.locator('[data-testid="shipping-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-city-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-zip-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-email-error"]')).toBeVisible();
  });

  test('should allow cancel back to cart from shipping', async ({ page }) => {
    await page.locator('[data-testid="checkout-cancel-btn"]').click();
    await expect(page.locator('[data-testid="cart-modal"]')).toBeVisible();
  });

  test('should proceed to payment after valid shipping info', async ({ page }) => {
    await page.locator('[data-testid="shipping-name-input"]').fill('John Doe');
    await page.locator('[data-testid="shipping-address-input"]').fill('123 Main St');
    await page.locator('[data-testid="shipping-city-input"]').fill('New York');
    await page.locator('[data-testid="shipping-zip-input"]').fill('10001');
    await page.locator('[data-testid="shipping-email-input"]').fill('john@example.com');
    await page.locator('[data-testid="checkout-next-btn"]').click();

    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Payment Info');
    await expect(page.locator('[data-testid="payment-card-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-expiry-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-cvv-input"]')).toBeVisible();
  });

  test('should show validation errors when payment form is submitted empty', async ({ page }) => {
    await page.locator('[data-testid="shipping-name-input"]').fill('John Doe');
    await page.locator('[data-testid="shipping-address-input"]').fill('123 Main St');
    await page.locator('[data-testid="shipping-city-input"]').fill('New York');
    await page.locator('[data-testid="shipping-zip-input"]').fill('10001');
    await page.locator('[data-testid="shipping-email-input"]').fill('john@example.com');
    await page.locator('[data-testid="checkout-next-btn"]').click();

    await page.locator('[data-testid="checkout-submit-btn"]').click();
    await expect(page.locator('[data-testid="payment-card-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-expiry-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-cvv-error"]')).toBeVisible();
  });

  test('should go back to shipping from payment', async ({ page }) => {
    await page.locator('[data-testid="shipping-name-input"]').fill('John Doe');
    await page.locator('[data-testid="shipping-address-input"]').fill('123 Main St');
    await page.locator('[data-testid="shipping-city-input"]').fill('New York');
    await page.locator('[data-testid="shipping-zip-input"]').fill('10001');
    await page.locator('[data-testid="shipping-email-input"]').fill('john@example.com');
    await page.locator('[data-testid="checkout-next-btn"]').click();

    await page.locator('[data-testid="checkout-back-btn"]').click();
    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Shipping Info');
  });

  test('should complete full checkout flow and show order confirmation', async ({ page }) => {
    await page.locator('[data-testid="shipping-name-input"]').fill('John Doe');
    await page.locator('[data-testid="shipping-address-input"]').fill('123 Main St');
    await page.locator('[data-testid="shipping-city-input"]').fill('New York');
    await page.locator('[data-testid="shipping-zip-input"]').fill('10001');
    await page.locator('[data-testid="shipping-email-input"]').fill('john@example.com');
    await page.locator('[data-testid="checkout-next-btn"]').click();

    await page.locator('[data-testid="payment-card-input"]').fill('4111111111111111');
    await page.locator('[data-testid="payment-expiry-input"]').fill('12/28');
    await page.locator('[data-testid="payment-cvv-input"]').fill('123');
    await page.locator('[data-testid="checkout-submit-btn"]').click();

    await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Order Confirmed!');
    await expect(page.locator('[data-testid="order-number"]')).not.toBeEmpty();
  });

  test('should clear cart and return to products after continue shopping', async ({ page }) => {
    await page.locator('[data-testid="shipping-name-input"]').fill('John Doe');
    await page.locator('[data-testid="shipping-address-input"]').fill('123 Main St');
    await page.locator('[data-testid="shipping-city-input"]').fill('New York');
    await page.locator('[data-testid="shipping-zip-input"]').fill('10001');
    await page.locator('[data-testid="shipping-email-input"]').fill('john@example.com');
    await page.locator('[data-testid="checkout-next-btn"]').click();

    await page.locator('[data-testid="payment-card-input"]').fill('4111111111111111');
    await page.locator('[data-testid="payment-expiry-input"]').fill('12/28');
    await page.locator('[data-testid="payment-cvv-input"]').fill('123');
    await page.locator('[data-testid="checkout-submit-btn"]').click();

    await page.locator('[data-testid="continue-shopping-btn"]').click();
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveClass(/hidden/);
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();
  });
});
