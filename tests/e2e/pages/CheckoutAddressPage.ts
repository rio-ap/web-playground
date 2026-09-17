import { type Page, type Locator, expect } from '@playwright/test';

export interface ShippingData {
  name: string;
  address: string;
  city: string;
  zip: string;
  email: string;
}

export class CheckoutAddressPage {
  readonly page: Page;
  readonly view: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly addressInput: Locator;
  readonly cityInput: Locator;
  readonly zipInput: Locator;
  readonly nameError: Locator;
  readonly emailError: Locator;
  readonly addressError: Locator;
  readonly cityError: Locator;
  readonly zipError: Locator;
  readonly continueBtn: Locator;
  readonly orderSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.view = page.locator('[data-testid="checkout-address-page"]');
    this.nameInput = page.locator('[data-testid="shipping-name-input"]');
    this.emailInput = page.locator('[data-testid="shipping-email-input"]');
    this.addressInput = page.locator('[data-testid="shipping-address-input"]');
    this.cityInput = page.locator('[data-testid="shipping-city-input"]');
    this.zipInput = page.locator('[data-testid="shipping-zip-input"]');
    this.nameError = page.locator('[data-testid="shipping-name-error"]');
    this.emailError = page.locator('[data-testid="shipping-email-error"]');
    this.addressError = page.locator('[data-testid="shipping-address-error"]');
    this.cityError = page.locator('[data-testid="shipping-city-error"]');
    this.zipError = page.locator('[data-testid="shipping-zip-error"]');
    this.continueBtn = page.locator('[data-testid="checkout-continue-btn"]');
    this.orderSummary = page.locator('[data-testid="order-summary"]');
  }

  async goto(): Promise<void> {
    await this.page.evaluate(() => {
      window.location.hash = '#/checkout/address';
    });
    await this.expectVisible();
  }

  async expectVisible(): Promise<void> {
    await expect(this.view).toBeVisible();
    await expect(this.nameInput).toBeVisible();
    await expect(this.orderSummary).toBeVisible();
  }

  async expectStepActive(step: 'address' | 'payment' | 'review'): Promise<void> {
    await expect(this.page.locator(`[data-testid="stepper-${step}"]`)).toHaveAttribute('data-state', 'active');
  }

  async fill(data: ShippingData): Promise<void> {
    await this.nameInput.fill(data.name);
    await this.emailInput.fill(data.email);
    await this.addressInput.fill(data.address);
    await this.cityInput.fill(data.city);
    await this.zipInput.fill(data.zip);
  }

  async continue(): Promise<void> {
    await this.continueBtn.click();
    await expect(this.page).toHaveURL(/#\/checkout\/payment$/);
  }

  async submit(data: ShippingData): Promise<void> {
    await this.fill(data);
    await this.continue();
  }

  async expectErrors(): Promise<void> {
    await expect(this.nameError).toBeVisible();
    await expect(this.emailError).toBeVisible();
    await expect(this.addressError).toBeVisible();
    await expect(this.cityError).toBeVisible();
    await expect(this.zipError).toBeVisible();
  }
}
