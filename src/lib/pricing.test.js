import { describe, it, expect } from 'vitest';
import { getSaleInfo, formatAed } from './pricing';

describe('getSaleInfo', () => {
  it('is not on sale without compareAtPrice', () => {
    expect(getSaleInfo({ price: 15 })).toEqual({
      onSale: false,
      price: 15,
      compareAt: null,
      percent: 0,
    });
  });

  it('computes percent when compareAt is higher', () => {
    const sale = getSaleInfo({ price: 15, compareAtPrice: 21 });
    expect(sale.onSale).toBe(true);
    expect(sale.price).toBe(15);
    expect(sale.compareAt).toBe(21);
    expect(sale.percent).toBe(29);
  });

  it('ignores compareAt that is not higher', () => {
    expect(getSaleInfo({ price: 15, compareAtPrice: 15 }).onSale).toBe(false);
  });
});

describe('formatAed', () => {
  it('drops trailing zeros for whole dirhams', () => {
    expect(formatAed(15)).toBe('15');
    expect(formatAed(14.7)).toBe('14.70');
  });
});
