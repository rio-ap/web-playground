import { test, expect } from '@playwright/test';

test.describe('Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('cart badge should be hidden when cart is empty', async ({ page }) => {
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toHaveClass(/hidden/);
  });

  test('adding a product should show badge with count 1', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).not.toHaveClass(/hidden/);
    await expect(badge).toHaveText('1');
  });

  test('adding same product twice should show count 2', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('2');
  });

  test('cart modal should open when toggle button is clicked', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await expect(page.locator('[data-testid="cart-modal"]')).toBeVisible();
  });

  test('cart modal should display the added item', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await expect(page.locator('[data-testid="cart-item-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-name-1"]')).not.toBeEmpty();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('1');
  });

  test('increment button should increase quantity in cart', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await page.locator('[data-testid="increment-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('2');
  });

  test('decrement button should decrease quantity in cart', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await page.locator('[data-testid="decrement-btn-1"]').click();
    await expect(page.locator('[data-testid="item-quantity-1"]')).toHaveText('1');
  });

  test('removing all quantity should hide the cart item', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await page.locator('[data-testid="decrement-btn-1"]').click();
    await expect(page.locator('[data-testid="cart-item-1"]')).not.toBeVisible();
  });

  test('remove button should remove the item from cart', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await page.locator('[data-testid="remove-btn-1"]').click();
    await expect(page.locator('[data-testid="cart-item-1"]')).not.toBeVisible();
  });

  test('cart modal close button should close the modal', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await page.locator('[data-testid="cart-close-btn"]').click();
    await expect(page.locator('[data-testid="cart-modal"]')).not.toBeVisible();
  });

  test('subtotal should update when quantity changes', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    const originalTotal = await page.locator('[data-testid="cart-total-price"]').textContent();
    await page.locator('[data-testid="increment-btn-1"]').click();
    const newTotal = await page.locator('[data-testid="cart-total-price"]').textContent();
    expect(newTotal).not.toBe(originalTotal);
  });

  test('multiple products should appear in cart', async ({ page }) => {
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await page.locator('[data-testid="add-to-cart-btn-2"]').click();
    await page.locator('[data-testid="add-to-cart-btn-3"]').click();
    await page.locator('[data-testid="cart-toggle-btn"]').click();
    await expect(page.locator('[data-testid="cart-item-1"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-2"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-item-3"]')).toBeVisible();
  });
});
