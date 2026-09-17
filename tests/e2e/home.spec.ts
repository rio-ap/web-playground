import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { ProductGridPage } from './pages/ProductGridPage';
import { CartModalPage } from './pages/CartModalPage';

test.describe('Home', { tag: '@home' }, () => {
  test('renders the hero and three featured products', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await home.expectWelcome();
    await expect(home.startShoppingBtn).toBeVisible();
    await expect(home.featuredGrid).toBeVisible();
    await expect(home.featuredCards).toHaveCount(3);
  });

  test('start shopping opens the shop with all six products', async ({ page }) => {
    const home = new HomePage(page);
    const products = new ProductGridPage(page);
    await home.goto();
    await home.startShopping();
    await products.expectVisible();
    await expect(products.productCards).toHaveCount(6);
  });

  test('adding a featured product updates the cart badge and shows a toast', async ({ page }) => {
    const home = new HomePage(page);
    const cart = new CartModalPage(page);
    await home.goto();
    await page.locator('[data-testid="add-to-cart-btn-1"]').click();
    await cart.expectBadgeCount(1);
    await expect(page.locator('[data-testid="toast"]')).toHaveText('Wireless Headphones added to cart');
  });

  test('unknown routes fall back to home', async ({ page }) => {
    await page.goto('/#/does-not-exist');
    await expect(page).toHaveURL(/#\/$/);
    await expect(page.locator('[data-testid="home-view"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome to Trazire Mart' })).toBeVisible();
  });
});
