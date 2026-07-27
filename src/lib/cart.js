/**
 * Pure cart helpers — unit-tested and used by App.jsx.
 * Limits match the live storefront: 50 items / 50kg / 50L.
 */

export const CART_LIMITS = {
  maxQuantity: 50,
  maxWeightKg: 50,
  maxVolumeL: 50,
};

/**
 * Parse weight/volume from a product name (e.g. "Fresh Paneer (500g)").
 * @param {string} name
 * @returns {{ weight: number, volume: number }} weight in kg, volume in liters
 */
export function parseProductUnit(name) {
  if (!name || typeof name !== 'string') return { weight: 0, volume: 0 };

  const match = name.match(/(\d+(\.\d+)?)\s*(kg|g|gm|ltr|l|ml)/i);
  if (!match) return { weight: 0, volume: 0 };

  const value = parseFloat(match[1]);
  const unit = match[3].toLowerCase();

  if (unit === 'kg') return { weight: value, volume: 0 };
  if (unit === 'g' || unit === 'gm') return { weight: value / 1000, volume: 0 };
  if (unit === 'ltr' || unit === 'l') return { weight: 0, volume: value };
  if (unit === 'ml') return { weight: 0, volume: value / 1000 };

  return { weight: 0, volume: 0 };
}

/**
 * @param {Array<{ name: string, quantity: number }>} cartItems
 * @returns {string|null} error message or null if OK
 */
export function checkCartLimits(cartItems) {
  let totalWeight = 0;
  let totalVolume = 0;
  let totalQuantity = 0;

  for (const item of cartItems) {
    const qty = item.quantity || 0;
    const { weight, volume } = parseProductUnit(item.name);
    totalWeight += weight * qty;
    totalVolume += volume * qty;
    totalQuantity += qty;
  }

  if (totalQuantity > CART_LIMITS.maxQuantity) {
    return 'Limit reached: You can only order up to 50 items in total.';
  }
  if (totalWeight > CART_LIMITS.maxWeightKg) {
    return 'Limit reached: Total weight cannot exceed 50kg.';
  }
  if (totalVolume > CART_LIMITS.maxVolumeL) {
    return 'Limit reached: Total volume cannot exceed 50 liters.';
  }

  return null;
}

/**
 * Add one unit of a product to the cart.
 * @returns {{ cart: Array, error: string|null }}
 */
export function addItemToCart(cartItems, product) {
  if (!product || product.id == null) {
    return { cart: cartItems, error: 'Invalid product.' };
  }

  const next = [...cartItems];
  const existingIndex = next.findIndex((item) => item.id === product.id);

  if (existingIndex >= 0) {
    next[existingIndex] = {
      ...next[existingIndex],
      quantity: next[existingIndex].quantity + 1,
    };
  } else {
    next.push({ ...product, quantity: 1 });
  }

  const error = checkCartLimits(next);
  if (error) return { cart: cartItems, error };

  return { cart: next, error: null };
}

/**
 * Remove a line item entirely.
 */
export function removeItemFromCart(cartItems, id) {
  return cartItems.filter((item) => item.id !== id);
}

/**
 * Set quantity for a line item. Quantity < 1 removes the item.
 * @returns {{ cart: Array, error: string|null }}
 */
export function updateItemQuantity(cartItems, id, newQuantity) {
  if (newQuantity < 1) {
    return { cart: removeItemFromCart(cartItems, id), error: null };
  }

  const next = cartItems.map((item) =>
    item.id === id ? { ...item, quantity: newQuantity } : item
  );

  const error = checkCartLimits(next);
  if (error) return { cart: cartItems, error };

  return { cart: next, error: null };
}

/**
 * Undo the last "add one" for a product (decrease qty by 1 or remove).
 */
export function undoLastAdd(cartItems, productId) {
  if (productId == null) return cartItems;

  const existingIndex = cartItems.findIndex((item) => item.id === productId);
  if (existingIndex < 0) return cartItems;

  const item = cartItems[existingIndex];
  if (item.quantity <= 1) {
    return cartItems.filter((i) => i.id !== productId);
  }

  return cartItems.map((i) =>
    i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
  );
}

/**
 * Cart line count (sum of quantities).
 */
export function cartTotalQuantity(cartItems) {
  return cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

/**
 * Cart subtotal (sum of price * quantity).
 */
export function cartSubtotal(cartItems) {
  return cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 0),
    0
  );
}
