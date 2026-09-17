import { type Page, type Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly view: Locator;
  readonly startShoppingBtn: Locator;
  readonly featuredGrid: Locator;
  readonly featuredCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.view = page.locator('[data-testid="home-view"]');
    this.startShoppingBtn = page.locator('[data-testid="start-shopping-btn"]');
    this.featuredGrid = page.locator('[data-testid="featured-grid"]');
    this.featuredCards = page.locator('[data-testid^="product-card-"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.expectWelcome();
  }

  async expectWelcome(): Promise<void> {
    await expect(this.view).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Welcome to Trazire Mart' })).toBeVisible();
  }

  async startShopping(): Promise<void> {
    await this.startShoppingBtn.click();
    await expect(this.page).toHaveURL(/#\/shop$/);
  }
}
