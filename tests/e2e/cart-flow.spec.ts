import { test } from '@playwright/test';
import { ProductGridPage } from './pages/ProductGridPage';
import { CartModalPage } from './pages/CartModalPage';

test.describe('Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    const products = new ProductGridPage(page);
    await products.goto();
  });

  test('cart badge should be hidden when cart is empty', async ({ page }) => {
    const cart = new CartModalPage(page);
    await cart.expectBadgeHidden();
  });

  test('adding a product should show badge with count 1', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.expectBadgeCount(1);
  });

  test('adding same product twice should show count 2', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await products.addToCart(1);
    await cart.expectBadgeCount(2);
  });

  test('cart modal should open when toggle button is clicked', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
  });

  test('cart modal should display the added item', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
    await cart.expectItemVisible(1);
    await cart.expectItemQuantity(1, 1);
  });

  test('increment button should increase quantity in cart', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
    await cart.incrementItem(1);
    await cart.expectItemQuantity(1, 2);
  });

  test('decrement button should decrease quantity in cart', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await products.addToCart(1);
    await cart.open();
    await cart.decrementItem(1);
    await cart.expectItemQuantity(1, 1);
  });

  test('removing all quantity should hide the cart item', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
    await cart.decrementItem(1);
    await cart.expectItemNotVisible(1);
  });

  test('remove button should remove the item from cart', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
    await cart.removeItem(1);
    await cart.expectItemNotVisible(1);
  });

  test('cart modal close button should close the modal', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
    await cart.close();
  });

  test('subtotal should update when quantity changes', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await cart.open();
    const originalTotal = await cart.totalPrice.textContent();
    await cart.incrementItem(1);
    await cart.expectTotalNotEqual(originalTotal ?? '');
  });

  test('multiple products should appear in cart', async ({ page }) => {
    const products = new ProductGridPage(page);
    const cart = new CartModalPage(page);
    await products.addToCart(1);
    await products.addToCart(2);
    await products.addToCart(3);
    await cart.open();
    await cart.expectItemVisible(1);
    await cart.expectItemVisible(2);
    await cart.expectItemVisible(3);
  });
});
