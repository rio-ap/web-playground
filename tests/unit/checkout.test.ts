import { describe, it, expect } from 'vitest';
import { validateShippingInfo, validatePaymentInfo, processOrder } from '../../src/checkout';
import { getSubtotal } from '../../src/cart';

describe('validateShippingInfo', () => {
  it('should return no errors for valid shipping data', () => {
    const data = { name: 'John', address: '123 St', city: 'NYC', zip: '10001', email: 'a@b.com' };
    expect(validateShippingInfo(data)).toEqual({});
  });

  it('should return error when name is missing', () => {
    const errors = validateShippingInfo({ address: '123 St', city: 'NYC', zip: '10001', email: 'a@b.com' });
    expect(errors.name).toBeDefined();
  });

  it('should return error when address is missing', () => {
    const errors = validateShippingInfo({ name: 'John', city: 'NYC', zip: '10001', email: 'a@b.com' });
    expect(errors.address).toBeDefined();
  });

  it('should return error when city is missing', () => {
    const errors = validateShippingInfo({ name: 'John', address: '123 St', zip: '10001', email: 'a@b.com' });
    expect(errors.city).toBeDefined();
  });

  it('should return error when zip is missing', () => {
    const errors = validateShippingInfo({ name: 'John', address: '123 St', city: 'NYC', email: 'a@b.com' });
    expect(errors.zip).toBeDefined();
  });

  it('should return error when email is missing', () => {
    const errors = validateShippingInfo({ name: 'John', address: '123 St', city: 'NYC', zip: '10001' });
    expect(errors.email).toBeDefined();
  });

  it('should reject whitespace-only fields', () => {
    const errors = validateShippingInfo({ name: '   ', address: '123 St', city: 'NYC', zip: '10001', email: 'a@b.com' });
    expect(errors.name).toBeDefined();
  });
});

describe('validatePaymentInfo', () => {
  it('should return no errors for valid payment data', () => {
    const data = { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' };
    expect(validatePaymentInfo(data)).toEqual({});
  });

  it('should return error when card number is missing', () => {
    const errors = validatePaymentInfo({ expiry: '12/28', cvv: '123' });
    expect(errors.card).toBeDefined();
  });

  it('should return error when expiry is missing', () => {
    const errors = validatePaymentInfo({ cardNumber: '4111111111111111', cvv: '123' });
    expect(errors.expiry).toBeDefined();
  });

  it('should return error when CVV is missing', () => {
    const errors = validatePaymentInfo({ cardNumber: '4111111111111111', expiry: '12/28' });
    expect(errors.cvv).toBeDefined();
  });

  it('should reject invalid card number length', () => {
    const errors = validatePaymentInfo({ cardNumber: '1234', expiry: '12/28', cvv: '123' });
    expect(errors.card).toBeDefined();
  });

  it('should reject invalid expiry format', () => {
    const errors = validatePaymentInfo({ cardNumber: '4111111111111111', expiry: '12-28', cvv: '123' });
    expect(errors.expiry).toBeDefined();
  });

  it('should reject invalid CVV length', () => {
    const errors = validatePaymentInfo({ cardNumber: '4111111111111111', expiry: '12/28', cvv: '12' });
    expect(errors.cvv).toBeDefined();
  });
});

describe('processOrder', () => {
  const cart = [
    { product: { id: 1, name: 'A', price: 10 }, quantity: 2 },
  ];
  const shipping = { name: 'John', address: '123 St', city: 'NYC', zip: '10001', email: 'a@b.com' };
  const payment = { cardNumber: '4111111111111111', expiry: '12/28', cvv: '123' };

  it('should return an order with a unique order number', () => {
    const order = processOrder(cart, shipping, payment);
    expect(order.orderNumber).toBeDefined();
    expect(order.orderNumber).toMatch(/^ORD-/);
  });

  it('should include cart items in the order', () => {
    const order = processOrder(cart, shipping, payment);
    expect(order.items).toEqual(cart);
  });

  it('should include shipping info in the order', () => {
    const order = processOrder(cart, shipping, payment);
    expect(order.shipping).toEqual(shipping);
  });

  it('should include last four digits of card number, not full number', () => {
    const order = processOrder(cart, shipping, payment);
    expect(order.payment.cardLastFour).toBe('1111');
    expect(order.payment.cardNumber).toBeUndefined();
  });

  it('should calculate the correct total', () => {
    const order = processOrder(cart, shipping, payment);
    expect(order.total).toBe(20);
  });

  it('should include a created timestamp', () => {
    const order = processOrder(cart, shipping, payment);
    expect(order.createdAt).toBeDefined();
    expect(typeof order.createdAt).toBe('string');
  });
});
