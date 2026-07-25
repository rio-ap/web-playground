import { type Page, type Locator, expect } from '@playwright/test';

export interface ShippingData {
  name: string;
  address: string;
  city: string;
  zip: string;
  email: string;
}

export interface PaymentData {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export class CheckoutPage {
  readonly page: Page;
  readonly stepTitle: Locator;
  readonly nameInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly zipInput: Locator;
  readonly emailInput: Locator;
  readonly nameError: Locator;
  readonly addressError: Locator;
  readonly cityError: Locator;
  readonly zipError: Locator;
  readonly emailError: Locator;
  readonly cardInput: Locator;
  readonly expiryInput: Locator;
  readonly cvvInput: Locator;
  readonly cardError: Locator;
  readonly expiryError: Locator;
  readonly cvvError: Locator;
  readonly nextBtn: Locator;
  readonly backBtn: Locator;
  readonly submitBtn: Locator;
  readonly cancelBtn: Locator;
  readonly continueShoppingBtn: Locator;
  readonly orderSuccess: Locator;

  constructor(page: Page) {
    this.page = page;
    this.stepTitle = page.locator('[data-testid="checkout-step-title"]');
    this.nameInput = page.locator('[data-testid="shipping-name-input"]');
    this.addressInput = page.locator('[data-testid="shipping-address-input"]');
    this.cityInput = page.locator('[data-testid="shipping-city-input"]');
    this.zipInput = page.locator('[data-testid="shipping-zip-input"]');
    this.emailInput = page.locator('[data-testid="shipping-email-input"]');
    this.nameError = page.locator('[data-testid="shipping-name-error"]');
    this.addressError = page.locator('[data-testid="shipping-address-error"]');
    this.cityError = page.locator('[data-testid="shipping-city-error"]');
    this.zipError = page.locator('[data-testid="shipping-zip-error"]');
    this.emailError = page.locator('[data-testid="shipping-email-error"]');
    this.cardInput = page.locator('[data-testid="payment-card-input"]');
    this.expiryInput = page.locator('[data-testid="payment-expiry-input"]');
    this.cvvInput = page.locator('[data-testid="payment-cvv-input"]');
    this.cardError = page.locator('[data-testid="payment-card-error"]');
    this.expiryError = page.locator('[data-testid="payment-expiry-error"]');
    this.cvvError = page.locator('[data-testid="payment-cvv-error"]');
    this.nextBtn = page.locator('[data-testid="checkout-next-btn"]');
    this.backBtn = page.locator('[data-testid="checkout-back-btn"]');
    this.submitBtn = page.locator('[data-testid="checkout-submit-btn"]');
    this.cancelBtn = page.locator('[data-testid="checkout-cancel-btn"]');
    this.continueShoppingBtn = page.locator('[data-testid="continue-shopping-btn"]');
    this.orderSuccess = page.locator('[data-testid="order-success"]');
  }

  async fillShipping(data: ShippingData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.zipInput.fill(data.zip);
    await this.emailInput.fill(data.email);
    await this.nextBtn.click();
  }

  async fillPayment(data: PaymentData): Promise<void> {
    await this.cardInput.fill(data.cardNumber);
    await this.expiryInput.fill(data.expiry);
    await this.cvvInput.fill(data.cvv);
    await this.submitBtn.click();
  }

  async cancel(): Promise<void> {
    await this.cancelBtn.click();
  }

  async goBack(): Promise<void> {
    await this.backBtn.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingBtn.click();
  }

  async expectShippingStep(): Promise<void> {
    await expect(this.stepTitle).toHaveText('Shipping Info');
    await expect(this.nameInput).toBeVisible();
    await expect(this.addressInput).toBeVisible();
    await expect(this.cityInput).toBeVisible();
    await expect(this.zipInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
  }

  async expectShippingErrors(): Promise<void> {
    await this.nextBtn.click();
    await expect(this.nameError).toBeVisible();
    await expect(this.addressError).toBeVisible();
    await expect(this.cityError).toBeVisible();
    await expect(this.zipError).toBeVisible();
    await expect(this.emailError).toBeVisible();
  }

  async expectPaymentStep(): Promise<void> {
    await expect(this.stepTitle).toHaveText('Payment Info');
    await expect(this.cardInput).toBeVisible();
    await expect(this.expiryInput).toBeVisible();
    await expect(this.cvvInput).toBeVisible();
  }

  async expectPaymentErrors(): Promise<void> {
    await this.submitBtn.click();
    await expect(this.cardError).toBeVisible();
    await expect(this.expiryError).toBeVisible();
    await expect(this.cvvError).toBeVisible();
  }

  async expectOrderConfirmed(): Promise<void> {
    await expect(this.stepTitle).toHaveText('Order Confirmed!');
    await expect(this.orderSuccess).toBeVisible();
    await expect(this.page.locator('[data-testid="order-number"]')).not.toBeEmpty();
  }
}
