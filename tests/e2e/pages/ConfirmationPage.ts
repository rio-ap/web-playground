import { type Page, type Locator, expect } from '@playwright/test';

export class ConfirmationPage {
  readonly page: Page;
  readonly view: Locator;
  readonly orderNumber: Locator;
  readonly continueShoppingBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.view = page.locator('[data-testid="confirmation-page"]');
    this.orderNumber = page.locator('[data-testid="order-number"]');
    this.continueShoppingBtn = page.locator('[data-testid="continue-shopping-btn"]');
  }

  async expectConfirmed(): Promise<void> {
    await expect(this.view).toBeVisible();
    await expect(this.orderNumber).not.toBeEmpty();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingBtn.click();
    await expect(this.page).toHaveURL(/#\/shop$/);
  }
}
