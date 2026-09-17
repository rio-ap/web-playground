import { describe, it, expect, beforeEach } from 'vitest';
import { createAddressView } from '../../src/views/checkout/address';
import { createPaymentView } from '../../src/views/checkout/payment';
import { createReviewView } from '../../src/views/checkout/review';
import { confirmationView } from '../../src/views/confirmation';
import { escapeHtml, orderSummary, stepper } from '../../src/views/checkout/layout';
import { reset, setShipping, setPayment, setLastOrder } from '../../src/checkout-state';
import { getProducts, formatPrice } from '../../src/products';

const [headphones, watch] = getProducts();
const cart = [
  { product: headphones, quantity: 2 },
  { product: watch, quantity: 1 },
];
const subtotal = headphones.price * 2 + watch.price;

const shipping = {
  name: 'Jane Doe',
  address: '1 Demo St',
  city: 'Springfield',
  zip: '12345',
  email: 'jane@example.com',
};
const payment = { cardNumber: '4242 4242 4242 4242', expiry: '12/28', cvv: '123' };

function render(view: { mount: (app: { innerHTML: string }) => void }): string {
  const app = { innerHTML: '' };
  view.mount(app);
  return app.innerHTML;
}

function mountWithCart(factory: (getCart: () => typeof cart) => { mount: (app: { innerHTML: string }) => void }) {
  return render(factory(() => cart));
}

describe('stepper', () => {
  it('marks the first step active and the rest upcoming', () => {
    const html = stepper(1);

    expect(html).toContain('data-testid="checkout-stepper"');
    expect(html).toContain('data-testid="stepper-address" data-state="active"');
    expect(html).toContain('data-testid="stepper-payment" data-state="upcoming"');
    expect(html).toContain('data-testid="stepper-review" data-state="upcoming"');
  });

  it('marks completed steps in the middle of the flow', () => {
    const html = stepper(2);

    expect(html).toContain('data-testid="stepper-address" data-state="done"');
    expect(html).toContain('data-testid="stepper-payment" data-state="active"');
    expect(html).toContain('data-testid="stepper-review" data-state="upcoming"');
  });

  it('marks both earlier steps done on the review step', () => {
    const html = stepper(3);

    expect(html).toContain('data-testid="stepper-address" data-state="done"');
    expect(html).toContain('data-testid="stepper-payment" data-state="done"');
    expect(html).toContain('data-testid="stepper-review" data-state="active"');
  });
});

describe('orderSummary', () => {
  it('lists every item with its line total and the subtotal', () => {
    const html = orderSummary(cart);

    expect(html).toContain('data-testid="order-summary"');
    expect(html).toContain(`data-testid="summary-item-${headphones.id}"`);
    expect(html).toContain(`data-testid="summary-item-${watch.id}"`);
    expect(html).toContain(formatPrice(headphones.price * 2));
    expect(html).toContain(formatPrice(watch.price));
    expect(html).toContain(`data-testid="summary-subtotal">${formatPrice(subtotal)}`);
    expect(html).toContain(`data-testid="summary-total">${formatPrice(subtotal)}`);
    expect(html).not.toContain('data-testid="summary-tax"');
  });

  it('shows a tax row when requested', () => {
    const html = orderSummary(cart, { tax: true });

    expect(html).toContain('data-testid="summary-tax"');
  });

  it('renders an empty state when the cart is empty', () => {
    const html = orderSummary([]);

    expect(html).toContain('data-testid="summary-empty"');
    expect(html).not.toContain('data-testid="summary-item-');
  });
});

describe('escapeHtml', () => {
  it('escapes markup so user input cannot break the template', () => {
    expect(escapeHtml('<b>"Jane" & \'co\'</b>')).toBe('&lt;b&gt;&quot;Jane&quot; &amp; &#39;co&#39;&lt;/b&gt;');
  });

  it('handles empty values', () => {
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('checkout address view', () => {
  it('renders the address form with the first step active', () => {
    const html = mountWithCart(createAddressView);

    expect(html).toContain('data-testid="checkout-address-page"');
    expect(html).toContain('data-testid="stepper-address" data-state="active"');
    expect(html).toContain('data-testid="shipping-name-input"');
    expect(html).toContain('data-testid="shipping-email-input"');
    expect(html).toContain('data-testid="shipping-address-input"');
    expect(html).toContain('data-testid="shipping-city-input"');
    expect(html).toContain('data-testid="shipping-zip-input"');
    expect(html).toContain('data-testid="shipping-name-error"');
    expect(html).toContain('data-action="checkout-continue"');
    expect(html).toContain('data-testid="order-summary"');
    expect(html).toContain(`data-testid="summary-total">${formatPrice(subtotal)}`);
  });

  it('prefills the form from the saved draft', () => {
    setShipping(shipping);
    const html = mountWithCart(createAddressView);

    expect(html).toContain(`value="${shipping.name}"`);
    expect(html).toContain(`value="${shipping.email}"`);
    expect(html).toContain(`value="${shipping.address}"`);
    expect(html).toContain(`value="${shipping.city}"`);
    expect(html).toContain(`value="${shipping.zip}"`);
  });
});

describe('checkout payment view', () => {
  it('renders the secure payment form with the second step active', () => {
    const html = mountWithCart(createPaymentView);

    expect(html).toContain('data-testid="checkout-payment-page"');
    expect(html).toContain('data-testid="stepper-address" data-state="done"');
    expect(html).toContain('data-testid="stepper-payment" data-state="active"');
    expect(html).toContain('data-testid="secure-payment-banner"');
    expect(html).toContain('data-testid="test-mode-chip"');
    expect(html).toContain('data-testid="payment-card-input"');
    expect(html).toContain('data-testid="payment-expiry-input"');
    expect(html).toContain('data-testid="payment-cvv-input"');
    expect(html).toContain('data-testid="payment-card-error"');
    expect(html).toContain('data-action="payment-review"');
    expect(html).toContain('data-testid="test-card-hint"');
    expect(html).toContain('data-testid="order-summary"');
    expect(html).toContain('data-testid="summary-tax"');
  });

  it('hides the brand chip until a card number is entered', () => {
    const html = mountWithCart(createPaymentView);

    expect(html).toContain('data-testid="card-brand"');
    expect(html).toMatch(/data-testid="card-brand"[^>]*hidden/);
  });

  it('prefills the saved payment details and shows the detected brand', () => {
    setPayment(payment);
    const html = mountWithCart(createPaymentView);

    expect(html).toContain(`value="${payment.cardNumber}"`);
    expect(html).toContain(`value="${payment.expiry}"`);
    expect(html).toMatch(/data-testid="card-brand"[^>]*>VISA</);
  });
});

describe('checkout review view', () => {
  beforeEach(() => {
    setShipping(shipping);
    setPayment(payment);
  });

  it('summarises the shipping address, payment and items', () => {
    const html = mountWithCart(createReviewView);

    expect(html).toContain('data-testid="checkout-review-page"');
    expect(html).toContain('data-testid="stepper-address" data-state="done"');
    expect(html).toContain('data-testid="stepper-payment" data-state="done"');
    expect(html).toContain('data-testid="stepper-review" data-state="active"');
    expect(html).toContain('data-testid="review-shipping"');
    expect(html).toContain(shipping.name);
    expect(html).toContain(shipping.address);
    expect(html).toContain('data-testid="review-payment"');
    expect(html).toContain('Visa ending 4242');
    expect(html).toContain('data-testid="review-items"');
    expect(html).toContain(`data-testid="summary-item-${headphones.id}"`);
    expect(html).toContain('data-action="place-order"');
    expect(html).toContain(`Place Order · ${formatPrice(subtotal)}`);
  });

  it('uses the order total in the sidebar', () => {
    const html = mountWithCart(createReviewView);

    expect(html).toContain(`data-testid="summary-total">${formatPrice(subtotal)}`);
  });

  it('falls back to an empty draft and a generic card label', () => {
    reset();
    const html = mountWithCart(createReviewView);

    expect(html).toContain('data-testid="checkout-review-page"');
    expect(html).toContain('Card ending');
  });

  it('labels a card without a detected brand generically', () => {
    setPayment({ cardNumber: '6011 0000 0000 0004', expiry: '12/28', cvv: '123' });
    const html = mountWithCart(createReviewView);

    expect(html).toContain('Card ending 0004');
  });
});

describe('confirmation view', () => {
  it('shows the order number and a continue shopping action', () => {
    setLastOrder({
      orderNumber: 'ORD-123-ABC',
      items: cart,
      shipping,
      payment: { cardLastFour: '4242' },
      total: subtotal,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
    const html = render(confirmationView);

    expect(html).toContain('data-testid="confirmation-page"');
    expect(html).toContain('data-testid="confirmation-check"');
    expect(html).toContain('data-testid="order-number"');
    expect(html).toContain('ORD-123-ABC');
    expect(html).toContain(shipping.name);
    expect(html).toContain('data-action="continue-shopping"');
    expect(html).toContain('data-testid="continue-shopping-btn"');
  });
});
