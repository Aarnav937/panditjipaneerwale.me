import { describe, it, expect } from 'vitest';
import { products, categories } from './products';
import { getSaleInfo } from '../lib/pricing';
import { addItemToCart, cartSubtotal, parseProductUnit } from '../lib/cart';
import { getDailyDiscountedProducts, getDailyFeaturedDeals } from '../lib/discounts';

describe('product catalog integrity', () => {
  it('exports a non-empty product list (full catalog retained)', () => {
    expect(products.length).toBeGreaterThanOrEqual(150);
    expect(products.length).toBe(161);
  });

  it('has the expected category list including All', () => {
    expect(categories[0]).toBe('All');
    expect(categories).toEqual(
      expect.arrayContaining([
        'Milk Products',
        'Everest Spices',
        'Bikaji Bikaneri',
        'Amul',
        'Chings',
        'Amul Kool',
        'Dhara',
        'Satvik',
        'Wagh Bakri',
      ])
    );
  });

  it('every product has required fields', () => {
    for (const p of products) {
      expect(p, `product missing fields: ${JSON.stringify(p)}`).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        category: expect.any(String),
        price: expect.any(Number),
        image: expect.any(String),
        description: expect.any(String),
      });
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.category.length).toBeGreaterThan(0);
      expect(p.price).toBeGreaterThanOrEqual(0);
      // image may be empty for a few rows — still a string field
    }
  });

  it('product ids are unique', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('almost all products have a non-empty image path', () => {
    const missing = products.filter((p) => !p.image);
    // Catalog integrity: allow a small residual, never invent images here
    expect(missing.length).toBeLessThanOrEqual(5);
  });

  it('every product category is a non-empty string used in the catalog', () => {
    const used = new Set(products.map((p) => p.category));
    expect(used.size).toBeGreaterThan(5);
    for (const c of used) {
      expect(c.length).toBeGreaterThan(0);
    }
  });

  it('keeps Fresh Paneer (500g) with expected price and image path', () => {
    const paneer = products.find((p) => p.id === 3);
    expect(paneer).toBeDefined();
    expect(paneer.name).toBe('Fresh Paneer (500g)');
    expect(paneer.price).toBe(20);
    expect(paneer.compareAtPrice).toBe(21);
    expect(paneer.image).toBe('images/packs/product-3.webp');
  });

  it('includes the organic milk launch offer as a regular catalog product', () => {
    const organicMilk = products.find((p) => p.id === 193);

    expect(organicMilk).toMatchObject({
      name: 'Organic Fresh Milk (1.5L)',
      category: 'Milk Products',
      price: 21,
      compareAtPrice: 25,
      image: 'images/packs/product-193.png',
      featuredPromotion: true,
    });
  });

  it('keeps the white butter offer, cart price and 250g quantity consistent', () => {
    const butter = products.find((product) => product.id === 195);

    expect(butter).toMatchObject({
      name: 'Organic White Butter (250g)',
      category: 'Milk Products',
      price: 15,
      compareAtPrice: 20,
      image: 'images/packs/product-195.webp',
      featuredPromotion: true,
    });
    expect(getSaleInfo(butter)).toMatchObject({ onSale: true, price: 15, compareAt: 20, percent: 25 });
    expect(parseProductUnit(butter.name)).toEqual({ weight: 0.25, volume: 0 });
    const { cart, error } = addItemToCart([], butter);
    expect(error).toBeNull();
    expect(cartSubtotal(cart)).toBe(15);

    for (const dateSeed of ['2026-09-30', '2026-10-01']) {
      const dailyCatalog = getDailyDiscountedProducts(products, { dateSeed });
      expect(dailyCatalog.find((product) => product.id === 195).compareAtPrice).toBe(20);
      expect(getDailyFeaturedDeals(dailyCatalog, 8, dateSeed).map((product) => product.id)).toContain(195);
    }
    expect(products.filter((product) => product.promotionalPopup).map((product) => product.id)).toEqual([194]);
  });

  it('keeps the cow curd offer, cart price and 1kg quantity consistent', () => {
    const curd = products.find((product) => product.id === 194);

    expect(curd).toMatchObject({
      name: 'Organic Cow Curd (Dahi) (1kg)',
      category: 'Milk Products',
      price: 10,
      compareAtPrice: 15,
      image: 'images/packs/product-194.png',
      featuredPromotion: true,
      promotionalPopup: true,
    });
    expect(getSaleInfo(curd)).toMatchObject({ onSale: true, price: 10, compareAt: 15, percent: 33 });
    expect(parseProductUnit(curd.name)).toEqual({ weight: 1, volume: 0 });
    const { cart, error } = addItemToCart([], curd);
    expect(error).toBeNull();
    expect(cartSubtotal(cart)).toBe(10);

    for (const date of ['2026-09-30', '2026-10-01']) {
      const dailyCatalog = getDailyDiscountedProducts(products, date);
      expect(dailyCatalog.find((product) => product.id === 194).compareAtPrice).toBe(15);
      expect(getDailyFeaturedDeals(dailyCatalog, 8, date).map((product) => product.id)).toContain(194);
    }
  });
});
