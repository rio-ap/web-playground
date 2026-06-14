import { getSubtotal } from './cart.js';

export function validateShippingInfo(data) {
  const errors = {};
  if (!data.name?.trim()) errors.name = 'Name is required';
  if (!data.address?.trim()) errors.address = 'Address is required';
  if (!data.city?.trim()) errors.city = 'City is required';
  if (!data.zip?.trim()) errors.zip = 'ZIP code is required';
  if (!data.email?.trim()) errors.email = 'Email is required';
  return errors;
}

export function validatePaymentInfo(data) {
  const errors = {};
  if (!data.cardNumber?.trim()) {
    errors.card = 'Card number is required';
  } else if (!/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
    errors.card = 'Invalid card number';
  }

  if (!data.expiry?.trim()) {
    errors.expiry = 'Expiry date is required';
  } else if (!/^\d{2}\/\d{2}$/.test(data.expiry)) {
    errors.expiry = 'Use MM/YY format';
  }

  if (!data.cvv?.trim()) {
    errors.cvv = 'CVV is required';
  } else if (!/^\d{3,4}$/.test(data.cvv)) {
    errors.cvv = 'Invalid CVV';
  }

  return errors;
}

export function processOrder(cart, shipping, payment) {
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return {
    orderNumber,
    items: [...cart],
    shipping: { ...shipping },
    payment: { cardLastFour: payment.cardNumber.slice(-4) },
    total: getSubtotal(cart),
    createdAt: new Date().toISOString(),
  };
}
