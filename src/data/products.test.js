import { describe, it, expect } from 'vitest';
import { products, categories } from './products';

describe('product catalog integrity', () => {
  it('exports a non-empty product list (full catalog retained)', () => {
    expect(products.length).toBeGreaterThanOrEqual(150);
    expect(products.length).toBe(158);
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
    expect(paneer.price).toBe(15);
    expect(paneer.image).toBe('images/products/product-3.webp');
  });
});
