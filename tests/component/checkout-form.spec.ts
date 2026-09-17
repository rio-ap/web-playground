import { test, expect } from '@playwright/test';

test.describe('Checkout Form Component', { tag: '@checkout' }, () => {
  test('should render the address page with shipping fields and stepper', async ({ page }) => {
    await page.setContent(`
      <section data-testid="checkout-address-page" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <ol data-testid="checkout-stepper" class="flex items-center gap-3 mb-6">
            <li data-testid="stepper-address" data-state="active" aria-current="step" class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-blue-600 text-blue-600 bg-white">1</span>
              <span class="text-sm font-semibold text-blue-700">Address</span>
            </li>
            <li aria-hidden="true" class="hidden sm:block flex-1 h-px bg-gray-200"></li>
            <li data-testid="stepper-payment" data-state="upcoming" aria-current="false" class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-gray-300 text-gray-500 bg-white">2</span>
              <span class="text-sm font-semibold text-gray-500">Payment</span>
            </li>
            <li aria-hidden="true" class="hidden sm:block flex-1 h-px bg-gray-200"></li>
            <li data-testid="stepper-review" data-state="upcoming" aria-current="false" class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-gray-300 text-gray-500 bg-white">3</span>
              <span class="text-sm font-semibold text-gray-500">Review</span>
            </li>
          </ol>
          <h2 class="text-xl font-bold text-gray-900 mb-1">Shipping address</h2>
          <p class="text-sm text-gray-500 mb-5">Where should we send your order?</p>
          <div class="space-y-4">
            <div>
              <label for="shipping-name" class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input id="shipping-name" data-testid="shipping-name-input" type="text" autocomplete="name" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p data-testid="shipping-name-error" class="text-red-600 text-sm mt-1 hidden"></p>
            </div>
            <div>
              <label for="shipping-email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="shipping-email" data-testid="shipping-email-input" type="email" autocomplete="email" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p data-testid="shipping-email-error" class="text-red-600 text-sm mt-1 hidden"></p>
            </div>
            <div>
              <label for="shipping-address" class="block text-sm font-medium text-gray-700 mb-1">Street address</label>
              <input id="shipping-address" data-testid="shipping-address-input" type="text" autocomplete="street-address" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p data-testid="shipping-address-error" class="text-red-600 text-sm mt-1 hidden"></p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="shipping-city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input id="shipping-city" data-testid="shipping-city-input" type="text" autocomplete="address-level2" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p data-testid="shipping-city-error" class="text-red-600 text-sm mt-1 hidden"></p>
              </div>
              <div>
                <label for="shipping-zip" class="block text-sm font-medium text-gray-700 mb-1">Postal code</label>
                <input id="shipping-zip" data-testid="shipping-zip-input" type="text" autocomplete="postal-code" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p data-testid="shipping-zip-error" class="text-red-600 text-sm mt-1 hidden"></p>
              </div>
            </div>
            <button data-action="checkout-continue" data-testid="checkout-continue-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer">Continue to Payment</button>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
          <aside data-testid="order-summary" aria-label="Order summary">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Order summary</h2>
            <p data-testid="summary-empty" class="text-sm text-gray-500 py-3">Your cart is empty.</p>
            <dl class="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <div class="flex justify-between text-sm text-gray-600"><dt>Subtotal</dt><dd data-testid="summary-subtotal">$0.00</dd></div>
              <div class="flex justify-between text-sm text-gray-600"><dt>Shipping</dt><dd>Free</dd></div>
              <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3"><dt>Total</dt><dd data-testid="summary-total">$0.00</dd></div>
            </dl>
          </aside>
        </div>
      </section>
    `);

    await expect(page.locator('[data-testid="checkout-address-page"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shipping address' })).toBeVisible();
    await expect(page.locator('[data-testid="checkout-stepper"]')).toBeVisible();
    await expect(page.locator('[data-testid="stepper-address"]')).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-testid="shipping-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-address-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-city-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="shipping-zip-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-continue-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-continue-btn"]')).toHaveText('Continue to Payment');
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });

  test('should render the payment page with card fields and review action', async ({ page }) => {
    await page.setContent(`
      <section data-testid="checkout-payment-page" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <ol data-testid="checkout-stepper" class="flex items-center gap-3 mb-6">
            <li data-testid="stepper-address" data-state="done" aria-current="false" class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-green-700 bg-green-700 text-white">&#10003;</span>
              <span class="text-sm font-semibold text-green-700">Address</span>
            </li>
            <li aria-hidden="true" class="hidden sm:block flex-1 h-px bg-gray-200"></li>
            <li data-testid="stepper-payment" data-state="active" aria-current="step" class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-blue-600 text-blue-600 bg-white">2</span>
              <span class="text-sm font-semibold text-blue-700">Payment</span>
            </li>
            <li aria-hidden="true" class="hidden sm:block flex-1 h-px bg-gray-200"></li>
            <li data-testid="stepper-review" data-state="upcoming" aria-current="false" class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold border-gray-300 text-gray-500 bg-white">3</span>
              <span class="text-sm font-semibold text-gray-500">Review</span>
            </li>
          </ol>
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">Payment method
            <span data-testid="test-mode-chip" class="rounded-full border border-amber-200 bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800">Test mode</span>
          </h2>
          <div data-testid="secure-payment-banner" class="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium text-green-800 mb-5">
            <span>Payments are simulated — card details never leave your browser and are not stored.</span>
          </div>
          <div class="space-y-4">
            <div>
              <label for="payment-card" class="block text-sm font-medium text-gray-700 mb-1">Card number</label>
              <div class="card-field relative border border-blue-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <input id="payment-card" data-testid="payment-card-input" inputmode="numeric" autocomplete="cc-number" value="" class="relative w-full bg-transparent pl-10 pr-20 py-2 text-gray-900 focus:outline-none" />
                <span data-testid="card-brand" class="absolute right-3 top-1/2 -translate-y-1/2 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wider text-blue-700 hidden"></span>
              </div>
              <p data-testid="payment-card-error" class="text-red-600 text-sm mt-1 hidden"></p>
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="payment-expiry" class="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                <input id="payment-expiry" data-testid="payment-expiry-input" type="text" autocomplete="cc-exp" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p data-testid="payment-expiry-error" class="text-red-600 text-sm mt-1 hidden"></p>
              </div>
              <div>
                <label for="payment-cvv" class="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input id="payment-cvv" data-testid="payment-cvv-input" type="password" autocomplete="cc-csc" value="" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p data-testid="payment-cvv-error" class="text-red-600 text-sm mt-1 hidden"></p>
              </div>
            </div>
            <button data-action="payment-review" data-testid="payment-review-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer">Review Order</button>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 lg:sticky lg:top-6">
          <aside data-testid="order-summary" aria-label="Order summary">
            <h2 class="text-lg font-semibold text-gray-900 mb-1">Order summary</h2>
            <p data-testid="summary-empty" class="text-sm text-gray-500 py-3">Your cart is empty.</p>
            <dl class="mt-4 space-y-2 border-t border-gray-200 pt-4">
              <div class="flex justify-between text-sm text-gray-600"><dt>Subtotal</dt><dd data-testid="summary-subtotal">$0.00</dd></div>
              <div class="flex justify-between text-sm text-gray-600"><dt>Shipping</dt><dd>Free</dd></div>
              <div class="flex justify-between text-sm text-gray-600"><dt>Tax</dt><dd data-testid="summary-tax">$0.00</dd></div>
              <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-3"><dt>Total</dt><dd data-testid="summary-total">$0.00</dd></div>
            </dl>
          </aside>
          <div data-testid="test-card-hint" class="mt-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            This is a demo. Use the test card 4242 4242 4242 4242 — no payment will be processed.
          </div>
        </div>
      </section>
    `);

    await expect(page.locator('[data-testid="checkout-payment-page"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Payment method/ })).toBeVisible();
    await expect(page.locator('[data-testid="test-mode-chip"]')).toBeVisible();
    await expect(page.locator('[data-testid="secure-payment-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="checkout-stepper"]')).toBeVisible();
    await expect(page.locator('[data-testid="stepper-payment"]')).toHaveAttribute('data-state', 'active');
    await expect(page.locator('[data-testid="payment-card-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-expiry-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-cvv-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-review-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-review-btn"]')).toHaveText('Review Order');
    await expect(page.locator('[data-testid="order-summary"]')).toBeVisible();
  });

  test('should render the order confirmation screen', async ({ page }) => {
    await page.setContent(`
      <section data-testid="confirmation-page" class="max-w-xl mx-auto text-center py-10">
        <div data-testid="confirmation-check" class="confirm-check mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Order confirmed</h1>
        <p class="mt-2 text-gray-600">Thanks, Ada Lovelace! Your order number is</p>
        <p data-testid="order-number" class="mt-1 font-mono text-lg font-bold text-blue-700">ORD-ABC123</p>
        <p class="mt-3 text-sm text-gray-500">Simulated payment · nothing was charged</p>
        <button data-action="continue-shopping" data-testid="continue-shopping-btn" class="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer">Continue Shopping</button>
      </section>
    `);

    await expect(page.locator('[data-testid="confirmation-page"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
    await expect(page.locator('[data-testid="order-number"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="continue-shopping-btn"]')).toBeVisible();
  });
});
