import { type Page, type Locator, expect } from '@playwright/test';

export interface PaymentData {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export class CheckoutPaymentPage {
  readonly page: Page;
  readonly view: Locator;
  readonly secureBanner: Locator;
  readonly testModeChip: Locator;
  readonly cardInput: Locator;
  readonly cardBrand: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly cardError: Locator;
  readonly expiryError: Locator;
  readonly cvvError: Locator;
  readonly reviewBtn: Locator;
  readonly testCardHint: Locator;
  readonly orderSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.view = page.locator('[data-testid="checkout-payment-page"]');
    this.secureBanner = page.locator('[data-testid="secure-payment-banner"]');
    this.testModeChip = page.locator('[data-testid="test-mode-chip"]');
    this.cardInput = page.locator('[data-testid="payment-card-input"]');
    this.cardBrand = page.locator('[data-testid="card-brand"]');
    this.expiryInput = page.locator('[data-testid="payment-expiry-input"]');
    this.cvvInput = page.locator('[data-testid="payment-cvv-input"]');
    this.cardError = page.locator('[data-testid="payment-card-error"]');
    this.expiryError = page.locator('[data-testid="payment-expiry-error"]');
    this.cvvError = page.locator('[data-testid="payment-cvv-error"]');
    this.reviewBtn = page.locator('[data-testid="payment-review-btn"]');
    this.testCardHint = page.locator('[data-testid="test-card-hint"]');
    this.orderSummary = page.locator('[data-testid="order-summary"]');
  }

  async goto(): Promise<void> {
    await this.page.evaluate(() => {
      window.location.hash = '#/checkout/payment';
    });
    await this.expectVisible();
  }

  async expectVisible(): Promise<void> {
    await expect(this.view).toBeVisible();
    await expect(this.cardInput).toBeVisible();
    await expect(this.secureBanner).toBeVisible();
  }

  async expectStepActive(step: 'address' | 'payment' | 'review'): Promise<void> {
    await expect(this.page.locator(`[data-testid="stepper-${step}"]`)).toHaveAttribute('data-state', 'active');
  }

  async fill(data: PaymentData): Promise<void> {
    await this.cardInput.fill(data.cardNumber);
    await this.expiryInput.fill(data.expiry);
    await this.cvvInput.fill(data.cvv);
  }

  async review(): Promise<void> {
    await this.reviewBtn.click();
    await expect(this.page).toHaveURL(/#\/checkout\/review$/);
  }

  async submit(data: PaymentData): Promise<void> {
    await this.fill(data);
    await this.review();
  }

  async expectErrors(): Promise<void> {
    await expect(this.cardError).toBeVisible();
    await expect(this.expiryError).toBeVisible();
    await expect(this.cvvError).toBeVisible();
  }
}
