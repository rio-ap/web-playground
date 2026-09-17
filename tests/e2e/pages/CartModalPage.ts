import { type Page, type Locator, expect } from '@playwright/test';

export class CartModalPage {
  readonly page: Page;
  readonly badge: Locator;
  readonly toggleBtn: Locator;
  readonly modal: Locator;
  readonly overlay: Locator;
  readonly closeBtn: Locator;
  readonly emptyMessage: Locator;
  readonly itemsContainer: Locator;
  readonly totalPrice: Locator;
  readonly checkoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.badge = page.locator('[data-testid="cart-badge"]');
    this.toggleBtn = page.locator('[data-testid="cart-toggle-btn"]');
    this.modal = page.locator('[data-testid="cart-modal"]');
    this.overlay = page.locator('[data-testid="cart-overlay"]');
    this.closeBtn = page.locator('[data-testid="cart-close-btn"]');
    this.emptyMessage = page.locator('[data-testid="cart-empty"]');
    this.itemsContainer = page.locator('[data-testid^="cart-item-"]');
    this.totalPrice = page.locator('[data-testid="cart-total-price"]');
    this.checkoutBtn = page.locator('[data-testid="checkout-btn"]');
  }

  async open(): Promise<void> {
    await this.toggleBtn.click();
    await expect(this.modal).toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeBtn.click();
    await expect(this.modal).not.toBeVisible();
  }

  async closeViaOverlay(): Promise<void> {
    await this.overlay.click();
    await expect(this.modal).not.toBeVisible();
  }

  async checkout(): Promise<void> {
    await this.checkoutBtn.click();
    await expect(this.page).toHaveURL(/#\/checkout\/address$/);
    await expect(this.page.locator('[data-testid="checkout-address-page"]')).toBeVisible();
  }

  async expectModalVisible(): Promise<void> {
    await expect(this.modal).toBeVisible();
  }

  async expectBadgeHidden(): Promise<void> {
    await expect(this.badge).toHaveClass(/hidden/);
  }

  async expectBadgeCount(count: number): Promise<void> {
    await expect(this.badge).not.toHaveClass(/hidden/);
    await expect(this.badge).toHaveText(String(count));
  }

  async expectEmpty(): Promise<void> {
    await expect(this.emptyMessage).toBeVisible();
  }

  async expectItemVisible(productId: number): Promise<void> {
    await expect(this.page.locator(`[data-testid="cart-item-${productId}"]`)).toBeVisible();
  }

  async expectItemNotVisible(productId: number): Promise<void> {
    await expect(this.page.locator(`[data-testid="cart-item-${productId}"]`)).not.toBeVisible();
  }

  async expectItemQuantity(productId: number, quantity: number): Promise<void> {
    await expect(this.page.locator(`[data-testid="item-quantity-${productId}"]`)).toHaveText(String(quantity));
  }

  async incrementItem(productId: number): Promise<void> {
    await this.page.locator(`[data-testid="increment-btn-${productId}"]`).click();
  }

  async decrementItem(productId: number): Promise<void> {
    await this.page.locator(`[data-testid="decrement-btn-${productId}"]`).click();
  }

  async removeItem(productId: number): Promise<void> {
    await this.page.locator(`[data-testid="remove-btn-${productId}"]`).click();
  }

  async expectTotalNotEqual(value: string): Promise<void> {
    const text = await this.totalPrice.textContent();
    expect(text).not.toBe(value);
  }
}
