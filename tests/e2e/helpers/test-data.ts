import type { ShippingData, PaymentData } from '../pages/CheckoutPage';

export const validShipping: ShippingData = {
  name: 'John Doe',
  address: '123 Main St',
  city: 'New York',
  zip: '10001',
  email: 'john@example.com',
};

export const validPayment: PaymentData = {
  cardNumber: '4111111111111111',
  expiry: '12/28',
  cvv: '123',
};
