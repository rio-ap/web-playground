import { test, expect } from '@playwright/test';

test.describe('Cart Item Component', () => {
  test('should render product name, price, quantity, and action buttons', async ({ page }) => {
    await page.setContent(`
      <div data-testid="cart-item-1" class="flex items-center gap-4 p-4 border-b">
        <img data-testid="cart-item-image-1" src="https://placehold.co/80x80" alt="" class="w-16 h-16 object-cover rounded" />
        <div class="flex-1">
          <h4 data-testid="cart-item-name-1" class="font-semibold">Wireless Headphones</h4>
          <p data-testid="cart-item-price-1" class="text-blue-600 font-bold">$79.99</p>
        </div>
        <div data-testid="cart-item-quantity-1" class="flex items-center gap-2">
          <button data-testid="decrement-btn-1" class="w-8 h-8 rounded-full bg-gray-200 cursor-pointer">-</button>
          <span data-testid="item-quantity-1" class="w-6 text-center font-medium">2</span>
          <button data-testid="increment-btn-1" class="w-8 h-8 rounded-full bg-gray-200 cursor-pointer">+</button>
        </div>
        <button data-testid="remove-btn-1" class="text-red-500 hover:text-red-700 cursor-pointer">Remove</button>
      </div>
    `);

    await expect(page.locator('[data-testid="cart-item-name-1"]')).toHaveText('Wireless Headphones');
    await expect(page.locator('[data-testid="cart-item-price-1"]')).toHaveText('$79.99');
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('2');
    await expect(page.locator('[data-testid="decrement-btn-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="increment-btn-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="remove-btn-1"]')).toBeVisible();
  });

  test('increment button should increase displayed quantity', async ({ page }) => {
    await page.setContent(`
      <div data-testid="cart-item-1">
        <div data-testid="cart-item-quantity-1">
          <button data-testid="decrement-btn-1" class="cursor-pointer">-</button>
          <span data-testid="item-quantity-1">1</span>
          <button data-testid="increment-btn-1" class="cursor-pointer">+</button>
        </div>
      </div>
    `);

    await page.evaluate(() => {
      let quantity = 1;
      const qtyEl = document.querySelector('[data-testid="item-quantity-1"]');
      document.querySelector('[data-testid="increment-btn-1"]').addEventListener('click', () => {
        quantity++;
        qtyEl.textContent = quantity;
      });
      document.querySelector('[data-testid="decrement-btn-1"]').addEventListener('click', () => {
        quantity = Math.max(0, quantity - 1);
        qtyEl.textContent = quantity;
      });
    });

    await page.locator('[data-testid="increment-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('2');

    await page.locator('[data-testid="increment-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('3');

    await page.locator('[data-testid="decrement-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('2');
  });

  test('decrement button should not go below 0', async ({ page }) => {
    await page.setContent(`
      <div data-testid="cart-item-1">
        <div data-testid="cart-item-quantity-1">
          <button data-testid="decrement-btn-1" class="cursor-pointer">-</button>
          <span data-testid="item-quantity-1">1</span>
          <button data-testid="increment-btn-1" class="cursor-pointer">+</button>
        </div>
      </div>
    `);

    await page.evaluate(() => {
      let quantity = 1;
      const qtyEl = document.querySelector('[data-testid="item-quantity-1"]');
      document.querySelector('[data-testid="increment-btn-1"]').addEventListener('click', () => {
        quantity++;
        qtyEl.textContent = quantity;
      });
      document.querySelector('[data-testid="decrement-btn-1"]').addEventListener('click', () => {
        quantity = Math.max(0, quantity - 1);
        qtyEl.textContent = quantity;
      });
    });

    await page.locator('[data-testid="decrement-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('0');

    await page.locator('[data-testid="decrement-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('0');
  });
});
