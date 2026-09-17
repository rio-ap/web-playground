import { type Page, type Locator, expect } from '@playwright/test';

export class CheckoutReviewPage {
  readonly page: Page;
  readonly view: Locator;
  readonly shippingBlock: Locator;
  readonly paymentBlock: Locator;
  readonly itemsBlock: Locator;
  readonly placeOrderBtn: Locator;
  readonly orderSummary: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.view = page.locator('[data-testid="checkout-review-page"]');
    this.shippingBlock = page.locator('[data-testid="review-shipping"]');
    this.paymentBlock = page.locator('[data-testid="review-payment"]');
    this.itemsBlock = page.locator('[data-testid="review-items"]');
    this.placeOrderBtn = page.locator('[data-testid="place-order-btn"]');
    this.orderSummary = page.locator('[data-testid="order-summary"]');
    this.total = page.locator('[data-testid="summary-total"]');
  }

  async goto(): Promise<void> {
    await this.page.evaluate(() => {
      window.location.hash = '#/checkout/review';
    });
    await this.expectVisible();
  }

  async expectVisible(): Promise<void> {
    await expect(this.view).toBeVisible();
    await expect(this.placeOrderBtn).toBeVisible();
  }

  async expectStepActive(step: 'address' | 'payment' | 'review'): Promise<void> {
    await expect(this.page.locator(`[data-testid="stepper-${step}"]`)).toHaveAttribute('data-state', 'active');
  }

  async placeOrder(): Promise<void> {
    await this.placeOrderBtn.click();
    await expect(this.page).toHaveURL(/#\/confirmation$/);
  }
}
