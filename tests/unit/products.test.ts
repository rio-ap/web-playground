import { describe, it, expect } from 'vitest';
import { getProducts, formatPrice } from '../../src/products';

describe('getProducts', () => {
  it('should return an array', () => {
    const products = getProducts();
    expect(Array.isArray(products)).toBe(true);
  });

  it('should return at least one product', () => {
    const products = getProducts();
    expect(products.length).toBeGreaterThan(0);
  });

  it('each product should have required fields', () => {
    const products = getProducts();
    for (const product of products) {
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('image');
      expect(product).toHaveProperty('description');
    }
  });

  it('each product should have a unique id', () => {
    const products = getProducts();
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('each product should have a positive price', () => {
    const products = getProducts();
    for (const product of products) {
      expect(product.price).toBeGreaterThan(0);
    }
  });
});

describe('formatPrice', () => {
  it('should format a number as USD currency', () => {
    expect(formatPrice(10)).toBe('$10.00');
    expect(formatPrice(10.5)).toBe('$10.50');
    expect(formatPrice(0.99)).toBe('$0.99');
  });

  it('should format zero as $0.00', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('should format large numbers with comma separators', () => {
    expect(formatPrice(1299.99)).toBe('$1,299.99');
  });

  it('should format whole numbers without decimal padding', () => {
    expect(formatPrice(25)).toBe('$25.00');
  });
});
