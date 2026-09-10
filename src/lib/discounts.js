/**
 * Automated Markup & Daily Discount Engine
 *
 * Generates realistic marked-up list prices (`compareAtPrice`) so that all
 * products appear on discount at random percentages. The customer's actual
 * checkout price (`price`) remains untouched (paying normal price while
 * seeing attractive sale badges).
 */

// High-quality 32-bit integer finalizer for uniform pseudo-randomness
function fmix32(h) {
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 0xffffffff;
}

function hashSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Returns a stable 0..1 pseudo-random float for a given seed and product id
 */
export function seededRandom(seed, id) {
  const s = typeof seed === 'number' ? seed : hashSeed(String(seed));
  const pid = Number(id) || 1;
  return fmix32(s ^ Math.imul(pid, 0xcc9e2d51));
}

/**
 * Returns today's standard date seed in YYYY-MM-DD format
 */
export function getTodaySeed() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Calculate a realistic, market-standard AED marked-up compareAtPrice
 * @param {number} price - The normal selling price
 * @param {number} rand - Float between 0 and 1
 * @returns {number} Marked-up list price
 */
export function calculateMarkedUpPrice(price, rand = 0.5) {
  const p = Number(price) || 0;
  if (p <= 0) return p;

  // Markup percentage between 18% and 36%
  const markupPercent = 0.18 + rand * 0.18;
  const rawCompare = p * (1 + markupPercent);

  let compareAt;
  if (p <= 5) {
    // Small items (e.g. AED 3-5): mark up by 1-2 AED
    compareAt = p + (rand > 0.4 ? 2 : 1);
  } else if (p <= 15) {
    // E.g. AED 6-15: round to nearest whole AED, minimum +2
    compareAt = Math.max(p + 2, Math.round(rawCompare));
  } else if (p <= 40) {
    // E.g. AED 16-40: round to nearest whole AED, minimum +4
    compareAt = Math.max(p + 4, Math.round(rawCompare));
  } else {
    // Larger items (e.g. AED 50+): round to nearest whole AED, minimum +6
    const rounded = Math.round(rawCompare);
    compareAt = Math.max(p + 6, rounded);
  }

  return compareAt;
}

/**
 * Enriches all products with automated daily randomized discounts.
 *
 * @param {Array} products - Array of product objects
 * @param {Object} [options]
 * @param {string} [options.dateSeed] - Optional date string (default: current YYYY-MM-DD)
 * @param {number} [options.discountRatio=1.0] - Fraction of products to put on sale (1.0 = all products)
 * @returns {Array} Enriched products with compareAtPrice
 */
export function getDailyDiscountedProducts(products, options = {}) {
  if (!Array.isArray(products)) return [];

  const dateSeed = options.dateSeed || getTodaySeed();
  const discountRatio = options.discountRatio ?? 1.0;

  return products.map((product) => {
    // If the product already has an explicit valid compareAtPrice in data (e.g. Fresh Paneer 500g), keep it
    if (product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price)) {
      return product;
    }

    const price = Number(product.price);
    if (!Number.isFinite(price) || price <= 0) {
      return product;
    }

    const rand = seededRandom(dateSeed, product.id);
    const shouldDiscount = discountRatio >= 1.0 || rand < discountRatio;

    if (!shouldDiscount) {
      return product;
    }

    const compareAtPrice = calculateMarkedUpPrice(price, rand);

    return {
      ...product,
      compareAtPrice,
    };
  });
}

/**
 * Automatically picks diverse featured deals for the day.
 * Always keeps Fresh Paneer (id: 3) as the #1 spotlight, and fills the rest
 * with a category-diverse selection rotating daily.
 *
 * @param {Array} products - Enriched product list
 * @param {number} [count=8] - Number of deals to feature
 * @param {string} [dateSeed] - Optional date string
 * @returns {Array} Selected products for the deals rail
 */
export function getDailyFeaturedDeals(products, count = 8, dateSeed) {
  if (!Array.isArray(products) || products.length === 0) return [];

  const seed = dateSeed || getTodaySeed();
  const signaturePaneer = products.find((p) => p.id === 3);
  const others = products.filter((p) => p.id !== 3);

  // Deterministically sort others using daily seed + product id
  const shuffled = [...others].sort(
    (a, b) => seededRandom(seed, a.id) - seededRandom(seed, b.id)
  );

  const selected = signaturePaneer ? [signaturePaneer] : [];
  const seenCategories = new Set(selected.map((p) => p.category));

  // Pass 1: Select 1 item per category for visual and culinary variety
  for (const p of shuffled) {
    if (selected.length >= count) break;
    if (!seenCategories.has(p.category)) {
      selected.push(p);
      seenCategories.add(p.category);
    }
  }

  // Pass 2: Fill any remaining slots
  for (const p of shuffled) {
    if (selected.length >= count) break;
    if (!selected.some((s) => s.id === p.id)) {
      selected.push(p);
    }
  }

  return selected;
}

/**
 * Calculate total customer savings in AED across cart items
 * @param {Array} cartItems
 * @returns {number}
 */
export function calculateCartSavings(cartItems) {
  if (!Array.isArray(cartItems)) return 0;
  return cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const compareAt = Number(item.compareAtPrice) || 0;
    const qty = Number(item.quantity) || 1;
    if (compareAt > price) {
      return acc + (compareAt - price) * qty;
    }
    return acc;
  }, 0);
}
