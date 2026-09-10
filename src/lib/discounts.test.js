import { describe, it, expect } from 'vitest';
import {
  calculateMarkedUpPrice,
  getDailyDiscountedProducts,
  getDailyFeaturedDeals,
  calculateCartSavings,
} from './discounts';

describe('calculateMarkedUpPrice', () => {
  it('always produces a compareAtPrice strictly greater than normal price', () => {
    const prices = [1, 3, 5, 10, 15, 20, 30, 50, 75, 100];
    prices.forEach((price) => {
      for (let r = 0; r <= 1; r += 0.25) {
        const compareAt = calculateMarkedUpPrice(price, r);
        expect(compareAt).toBeGreaterThan(price);
        expect(Number.isInteger(compareAt)).toBe(true);
      }
    });
  });

  it('handles non-positive prices gracefully', () => {
    expect(calculateMarkedUpPrice(0)).toBe(0);
    expect(calculateMarkedUpPrice(-5)).toBe(-5);
  });
});

describe('getDailyDiscountedProducts', () => {
  const sampleProducts = [
    { id: 3, name: 'Fresh Paneer (500g)', category: 'Milk Products', price: 15, compareAtPrice: 21 },
    { id: 50, name: 'Fresh Khoa Mava (1kg)', category: 'Milk Products', price: 50 },
    { id: 51, name: 'Fresh Malai Paneer (1kg)', category: 'Milk Products', price: 30 },
    { id: 52, name: 'KDD Thick Cooking Cream (1 Ltr)', category: 'Milk Products', price: 16 },
    { id: 5, name: 'Bikaji Bhujia', category: 'Bikaji Bikaneri', price: 10 },
    { id: 6, name: 'Amul Butter (100g)', category: 'Amul', price: 20 },
    { id: 7, name: 'Chings Schezwan Chutney', category: 'Chings', price: 14 },
    { id: 10, name: 'Sample Item 10', category: 'Everest Spices', price: 25 },
    { id: 91, name: 'Sample Item 91', category: 'Everest Spices', price: 12 },
    { id: 999, name: 'Random Item', category: 'Satvik', price: 18 },
  ];

  it('puts all products on discount by default (100% discount ratio)', () => {
    const result = getDailyDiscountedProducts(sampleProducts, { dateSeed: '2026-09-10' });
    result.forEach((p) => {
      expect(p.compareAtPrice).toBeDefined();
      expect(p.compareAtPrice).toBeGreaterThan(p.price);
    });
  });

  it('preserves existing explicit compareAtPrice on products (like Product #3)', () => {
    const result = getDailyDiscountedProducts(sampleProducts, { dateSeed: '2026-09-10' });
    const p3 = result.find((p) => p.id === 3);
    expect(p3.compareAtPrice).toBe(21);
    expect(p3.price).toBe(15);
  });

  it('is completely deterministic for the same date seed', () => {
    const run1 = getDailyDiscountedProducts(sampleProducts, { dateSeed: '2026-09-10' });
    const run2 = getDailyDiscountedProducts(sampleProducts, { dateSeed: '2026-09-10' });
    expect(run1).toEqual(run2);
  });

  it('does not alter the actual selling price of any product', () => {
    const result = getDailyDiscountedProducts(sampleProducts, { dateSeed: '2026-09-10' });
    sampleProducts.forEach((original) => {
      const processed = result.find((p) => p.id === original.id);
      expect(processed.price).toBe(original.price);
    });
  });
});

describe('getDailyFeaturedDeals', () => {
  const sampleProducts = [
    { id: 3, name: 'Fresh Paneer (500g)', category: 'Milk Products', price: 15 },
    { id: 50, name: 'Fresh Khoa Mava (1kg)', category: 'Milk Products', price: 50 },
    { id: 5, name: 'Bikaji Bhujia', category: 'Bikaji Bikaneri', price: 10 },
    { id: 6, name: 'Amul Butter (100g)', category: 'Amul', price: 20 },
    { id: 7, name: 'Chings Schezwan Chutney', category: 'Chings', price: 14 },
    { id: 10, name: 'Everest Pav Bhaji Masala', category: 'Everest Spices', price: 6 },
    { id: 63, name: 'Satvik Mustard Oil', category: 'Satvik', price: 15 },
    { id: 92, name: 'Wagh Bakri Tea', category: 'Wagh Bakri', price: 13.5 },
    { id: 79, name: 'Amul Kool', category: 'Amul Kool', price: 6 },
  ];

  it('always keeps Fresh Paneer (id: 3) as the first deal', () => {
    const deals = getDailyFeaturedDeals(sampleProducts, 8, '2026-09-10');
    expect(deals[0].id).toBe(3);
  });

  it('returns the requested number of unique deals', () => {
    const deals = getDailyFeaturedDeals(sampleProducts, 6, '2026-09-10');
    expect(deals.length).toBe(6);
    const ids = deals.map((d) => d.id);
    expect(new Set(ids).size).toBe(6);
  });

  it('promotes category diversity across selected deals', () => {
    const deals = getDailyFeaturedDeals(sampleProducts, 6, '2026-09-10');
    const categories = deals.map((d) => d.category);
    expect(new Set(categories).size).toBeGreaterThanOrEqual(5);
  });

  it('handles empty or missing input gracefully', () => {
    expect(getDailyFeaturedDeals([])).toEqual([]);
    expect(getDailyFeaturedDeals(null)).toEqual([]);
  });
});

describe('calculateCartSavings', () => {
  it('calculates total savings correctly across cart items', () => {
    const cart = [
      { id: 3, price: 15, compareAtPrice: 21, quantity: 2 }, // saves (21-15)*2 = 12
      { id: 6, price: 20, compareAtPrice: 26, quantity: 1 }, // saves (26-20)*1 = 6
      { id: 999, price: 10, quantity: 3 }, // no compareAtPrice, saves 0
    ];
    expect(calculateCartSavings(cart)).toBe(18);
  });

  it('returns 0 for empty or invalid cart', () => {
    expect(calculateCartSavings([])).toBe(0);
    expect(calculateCartSavings(null)).toBe(0);
  });
});
