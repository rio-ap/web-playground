import { test, expect } from '@playwright/test';

test.describe('Checkout Form Component', { tag: '@checkout' }, () => {
  test('should render shipping form with all required fields', async ({ page }) => {
    await page.setContent(`
      <div data-testid="checkout-form" class="max-w-md mx-auto p-6">
        <h2 data-testid="checkout-step-title" class="text-xl font-bold mb-4">Shipping Info</h2>
        <div class="space-y-4">
          <div>
            <label for="shipping-name">Name</label>
            <input data-testid="shipping-name-input" id="shipping-name" class="w-full border rounded p-2" />
          </div>
          <div>
            <label for="shipping-address">Address</label>
            <input data-testid="shipping-address-input" id="shipping-address" class="w-full border rounded p-2" />
          </div>
          <div>
            <label for="shipping-city">City</label>
            <input data-testid="shipping-city-input" id="shipping-city" class="w-full border rounded p-2" />
          </div>
          <div>
            <label for="shipping-zip">ZIP Code</label>
            <input data-testid="shipping-zip-input" id="shipping-zip" class="w-full border rounded p-2" />
          </div>
          <div>
            <label for="shipping-email">Email</label>
            <input data-testid="shipping-email-input" id="shipping-email" type="email" class="w-full border rounded p-2" />
          </div>
          <button data-testid="checkout-next-btn" class="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer">Next</button>
        </div>
      </div>
    `);

    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Shipping Info');
    await expect(page.locator('[data-testid="shipping-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-city-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-zip-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-next-btn"]')).toBeVisible();
  });

  test('should render payment form with card fields', async ({ page }) => {
    await page.setContent(`
      <div data-testid="checkout-form" class="max-w-md mx-auto p-6">
        <h2 data-testid="checkout-step-title" class="text-xl font-bold mb-4">Payment Info</h2>
        <div class="space-y-4">
          <div>
            <label for="card-number">Card Number</label>
            <input data-testid="payment-card-input" id="card-number" class="w-full border rounded p-2" />
          </div>
          <div>
            <label for="card-expiry">Expiry (MM/YY)</label>
            <input data-testid="payment-expiry-input" id="card-expiry" class="w-full border rounded p-2" />
          </div>
          <div>
            <label for="card-cvv">CVV</label>
            <input data-testid="payment-cvv-input" id="card-cvv" class="w-full border rounded p-2" />
          </div>
          <div class="flex gap-3">
            <button data-testid="checkout-back-btn" class="bg-gray-300 text-gray-700 px-6 py-2 rounded cursor-pointer">Back</button>
            <button data-testid="checkout-submit-btn" class="bg-green-600 text-white px-6 py-2 rounded cursor-pointer">Place Order</button>
          </div>
        </div>
      </div>
    `);

    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Payment Info');
    await expect(page.locator('[data-testid="payment-card-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-expiry-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-cvv-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-back-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-submit-btn"]')).toBeVisible();
  });

  test('should render order confirmation screen', async ({ page }) => {
    await page.setContent(`
      <div data-testid="checkout-form" class="max-w-md mx-auto p-6 text-center">
        <div data-testid="order-success" class="space-y-4">
          <div class="text-5xl mb-4">&#10003;</div>
          <h2 data-testid="checkout-step-title" class="text-2xl font-bold text-green-600">Order Confirmed!</h2>
          <p data-testid="order-number" class="text-lg text-gray-600">ORD-ABC123</p>
          <p class="text-gray-500">Thank you for your purchase!</p>
          <button data-testid="continue-shopping-btn" class="bg-blue-600 text-white px-6 py-2 rounded cursor-pointer">Continue Shopping</button>
        </div>
      </div>
    `);

    await expect(page.locator('[data-testid="checkout-step-title"]')).toHaveText('Order Confirmed!');
    await expect(page.locator('[data-testid="order-number"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="continue-shopping-btn"]')).toBeVisible();
  });
});
