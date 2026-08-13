/**
 * Sale helper. `price` is what the shopper pays.
 * `compareAtPrice` is the online list price (must be higher than price).
 */
export function getSaleInfo(product) {
  const price = Number(product?.price) || 0;
  const compareAt = Number(product?.compareAtPrice);
  if (!compareAt || compareAt <= price) {
    return { onSale: false, price, compareAt: null, percent: 0 };
  }
  return {
    onSale: true,
    price,
    compareAt,
    percent: Math.round((1 - price / compareAt) * 100),
  };
}

export function formatAed(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0';
  return n % 1 === 0 ? String(n) : n.toFixed(2);
}
