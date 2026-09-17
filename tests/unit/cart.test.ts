import { describe, it, expect } from 'vitest';
import { addItem, removeItem, updateQuantity, getSubtotal, getItemCount } from '../../src/cart';

describe('addItem', () => {
  it('should add a new product with quantity 1', () => {
    const result = addItem([], { id: 1, name: 'A', price: 10 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ product: { id: 1, name: 'A', price: 10 }, quantity: 1 });
  });

  it('should increment quantity when product already in cart', () => {
    const cart = [{ product: { id: 1, name: 'A', price: 10 }, quantity: 2 }];
    const result = addItem(cart, { id: 1, name: 'A', price: 10 });
    expect(result[0].quantity).toBe(3);
  });

  it('should not mutate the original cart array', () => {
    const cart = [];
    addItem(cart, { id: 1, name: 'A', price: 10 });
    expect(cart).toEqual([]);
  });
});

describe('removeItem', () => {
  it('should remove item by product id', () => {
    const cart = [
      { product: { id: 1 }, quantity: 1 },
      { product: { id: 2 }, quantity: 2 },
    ];
    expect(removeItem(cart, 1)).toEqual([{ product: { id: 2 }, quantity: 2 }]);
  });

  it('should return empty array when removing last item', () => {
    expect(removeItem([{ product: { id: 1 }, quantity: 1 }], 1)).toEqual([]);
  });

  it('should not mutate the original cart', () => {
    const cart = [{ product: { id: 1 }, quantity: 1 }];
    removeItem(cart, 1);
    expect(cart).toHaveLength(1);
  });
});

describe('updateQuantity', () => {
  it('should update quantity for a product', () => {
    const cart = [{ product: { id: 1, price: 10 }, quantity: 1 }];
    expect(updateQuantity(cart, 1, 5)).toEqual([{ product: { id: 1, price: 10 }, quantity: 5 }]);
  });

  it('should remove item when quantity is 0', () => {
    expect(updateQuantity([{ product: { id: 1 }, quantity: 3 }], 1, 0)).toEqual([]);
  });

  it('should remove item when quantity is negative', () => {
    expect(updateQuantity([{ product: { id: 1 }, quantity: 3 }], 1, -1)).toEqual([]);
  });
});

describe('getSubtotal', () => {
  it('should calculate subtotal of all items', () => {
    const cart = [
      { product: { id: 1, price: 10 }, quantity: 2 },
      { product: { id: 2, price: 5.5 }, quantity: 3 },
    ];
    expect(getSubtotal(cart)).toBeCloseTo(36.5);
  });

  it('should return 0 for an empty cart', () => {
    expect(getSubtotal([])).toBe(0);
  });
});

describe('getItemCount', () => {
  it('should return total quantity across all items', () => {
    const cart = [
      { product: { id: 1 }, quantity: 2 },
      { product: { id: 2 }, quantity: 3 },
    ];
    expect(getItemCount(cart)).toBe(5);
  });

  it('should return 0 for an empty cart', () => {
    expect(getItemCount([])).toBe(0);
  });
});
