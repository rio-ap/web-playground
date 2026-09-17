import { describe, it, expect, beforeEach } from 'vitest';
import {
  setShipping,
  getShipping,
  setPayment,
  getPayment,
  setLastOrder,
  getLastOrder,
  clearDraft,
  reset,
} from '../../src/checkout-state';

const shipping = { name: 'John Doe', address: '123 Main St', city: 'New York', zip: '10001', email: 'john@example.com' };
const payment = { cardNumber: '4111 1111 1111 1111', expiry: '12/28', cvv: '123' };
const order = { orderNumber: 'ORD-1', items: [], total: 0 };

describe('checkout-state', () => {
  beforeEach(() => {
    reset();
  });

  it('starts with an empty draft', () => {
    expect(getShipping()).toBeNull();
    expect(getPayment()).toBeNull();
    expect(getLastOrder()).toBeNull();
  });

  it('stores and returns shipping info', () => {
    setShipping(shipping);
    expect(getShipping()).toEqual(shipping);
  });

  it('stores and returns payment info', () => {
    setPayment(payment);
    expect(getPayment()).toEqual(payment);
  });

  it('stores and returns the last order', () => {
    setLastOrder(order);
    expect(getLastOrder()).toEqual(order);
  });

  it('keeps shipping, payment and order independent', () => {
    setShipping(shipping);
    setPayment(payment);
    setLastOrder(order);

    expect(getShipping()).toEqual(shipping);
    expect(getPayment()).toEqual(payment);
    expect(getLastOrder()).toEqual(order);
  });

  it('clears the whole draft on reset', () => {
    setShipping(shipping);
    setPayment(payment);
    setLastOrder(order);

    reset();

    expect(getShipping()).toBeNull();
    expect(getPayment()).toBeNull();
    expect(getLastOrder()).toBeNull();
  });

  it('clears shipping and payment but keeps the last order for a new checkout', () => {
    setShipping(shipping);
    setPayment(payment);
    setLastOrder(order);

    clearDraft();

    expect(getShipping()).toBeNull();
    expect(getPayment()).toBeNull();
    expect(getLastOrder()).toEqual(order);
  });
});
