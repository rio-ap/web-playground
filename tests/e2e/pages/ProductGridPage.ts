import { type Page, type Locator, expect } from '@playwright/test';

export class ProductGridPage {
  readonly page: Page;
  readonly grid: Locator;
  readonly productCards: Locator;
  readonly addToCartButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.grid = page.locator('[data-testid="product-grid"]');
    this.productCards = page.locator('[data-testid^="product-card-"]');
    this.addToCartButtons = page.locator('[data-testid^="add-to-cart-btn-"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/#/shop');
    await this.expectVisible();
  }

  async getCardCount(): Promise<number> {
    return await this.productCards.count();
  }

  async addToCart(productId: number): Promise<void> {
    await this.page.locator(`[data-testid="add-to-cart-btn-${productId}"]`).click();
  }

  async expectVisible(): Promise<void> {
    await expect(this.grid).toBeVisible();
  }

  async expectAtLeastOneProduct(): Promise<void> {
    const count = await this.getCardCount();
    expect(count).toBeGreaterThan(0);
  }

  async expectProductCardVisible(productId: number): Promise<void> {
    const card = this.page.locator(`[data-testid="product-card-${productId}"]`);
    await expect(card).toBeVisible();
    await expect(card.locator('[data-testid*="product-name"]')).toBeVisible();
    await expect(card.locator('[data-testid*="product-price"]')).toBeVisible();
    await expect(card.locator('[data-testid*="product-image"]')).toBeVisible();
  }

  async expectAllAddToCartButtonsEnabled(): Promise<void> {
    const count = await this.addToCartButtons.count();
    for (let i = 0; i < count; i++) {
      await expect(this.addToCartButtons.nth(i)).toBeEnabled();
    }
  }
}
