import { describe, it, expect } from 'vitest';
import {
  parseProductUnit,
  checkCartLimits,
  addItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  undoLastAdd,
  cartTotalQuantity,
  cartSubtotal,
  CART_LIMITS,
} from './cart';

const paneer = {
  id: 3,
  name: 'Fresh Paneer (500g)',
  category: 'Milk Products',
  price: 15,
  image: 'images/products/product-3.webp',
  description: 'Soft and fresh paneer, perfect for curries.',
};

const cream = {
  id: 52,
  name: 'KDD Thick Cooking Cream (1 Ltr)',
  category: 'Milk Products',
  price: 16,
  image: 'images/products/product-52.webp',
  description: 'Thick cooking cream for rich gravies.',
};

describe('parseProductUnit', () => {
  it('parses grams to kg', () => {
    expect(parseProductUnit('Fresh Paneer (500g)')).toEqual({ weight: 0.5, volume: 0 });
  });

  it('parses kg', () => {
    expect(parseProductUnit('Fresh Khoa Mava (1kg)')).toEqual({ weight: 1, volume: 0 });
  });

  it('parses liters', () => {
    expect(parseProductUnit('KDD Thick Cooking Cream (1 Ltr)')).toEqual({
      weight: 0,
      volume: 1,
    });
  });

  it('returns zeros for names without units', () => {
    expect(parseProductUnit('Bikaji Bhujia')).toEqual({ weight: 0, volume: 0 });
  });
});

describe('addItemToCart', () => {
  it('adds a new line with quantity 1', () => {
    const { cart, error } = addItemToCart([], paneer);
    expect(error).toBeNull();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(1);
    expect(cart[0].id).toBe(3);
  });

  it('increments quantity for the same product id', () => {
    const first = addItemToCart([], paneer).cart;
    const { cart, error } = addItemToCart(first, paneer);
    expect(error).toBeNull();
    expect(cart).toHaveLength(1);
    expect(cart[0].quantity).toBe(2);
  });

  it('rejects invalid product', () => {
    const { cart, error } = addItemToCart([], null);
    expect(error).toBeTruthy();
    expect(cart).toEqual([]);
  });
});

describe('checkCartLimits', () => {
  it('allows carts under limits', () => {
    expect(checkCartLimits([{ ...paneer, quantity: 2 }])).toBeNull();
  });

  it('blocks more than max quantity', () => {
    const items = [{ ...paneer, quantity: CART_LIMITS.maxQuantity + 1 }];
    expect(checkCartLimits(items)).toMatch(/50 items/i);
  });

  it('blocks total weight over 50kg', () => {
    const items = [{ id: 1, name: 'Bulk (51kg)', quantity: 1, price: 1 }];
    expect(checkCartLimits(items)).toMatch(/50kg/i);
  });

  it('blocks total volume over 50L', () => {
    // One line with 51 liters — under the 50-item count limit, over volume
    const items = [{ id: 99, name: 'Bulk Oil (51 Ltr)', quantity: 1, price: 1 }];
    expect(checkCartLimits(items)).toMatch(/50 liters/i);
  });
});

describe('updateItemQuantity / remove / undo', () => {
  it('updates quantity', () => {
    const start = [{ ...paneer, quantity: 1 }];
    const { cart, error } = updateItemQuantity(start, 3, 4);
    expect(error).toBeNull();
    expect(cart[0].quantity).toBe(4);
  });

  it('removes when quantity drops below 1', () => {
    const start = [{ ...paneer, quantity: 2 }];
    const { cart } = updateItemQuantity(start, 3, 0);
    expect(cart).toHaveLength(0);
  });

  it('removeItemFromCart drops the line', () => {
    const start = [
      { ...paneer, quantity: 1 },
      { ...cream, quantity: 1 },
    ];
    expect(removeItemFromCart(start, 3)).toHaveLength(1);
    expect(removeItemFromCart(start, 3)[0].id).toBe(52);
  });

  it('undoLastAdd decrements then removes', () => {
    const two = [{ ...paneer, quantity: 2 }];
    const one = undoLastAdd(two, 3);
    expect(one[0].quantity).toBe(1);
    expect(undoLastAdd(one, 3)).toHaveLength(0);
  });
});

describe('totals', () => {
  it('sums quantity and subtotal', () => {
    const cart = [
      { ...paneer, quantity: 2 },
      { ...cream, quantity: 1 },
    ];
    expect(cartTotalQuantity(cart)).toBe(3);
    expect(cartSubtotal(cart)).toBe(15 * 2 + 16);
  });
});
