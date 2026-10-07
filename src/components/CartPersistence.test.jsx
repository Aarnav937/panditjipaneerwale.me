import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Cart from './Cart';

const checkout = vi.hoisted(() => ({ placeOrder: vi.fn(), loginAsGuest: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => checkout }));
vi.mock('../context/WishlistContext', () => ({ useWishlist: () => ({ wishlist: [], removeFromWishlist: vi.fn() }) }));
vi.mock('../lib/useMediaQuery', () => ({ useMediaQuery: () => false, useVisualViewport: () => ({}) }));

describe('checkout receipt handling', () => {
  beforeEach(() => {
    checkout.placeOrder.mockReset(); checkout.loginAsGuest.mockReset();
    localStorage.setItem('customerName', 'Checkout Test');
    localStorage.setItem('customerPhone', '971500000000');
    localStorage.setItem('customerAddress', 'Test address in Abu Dhabi');
  });
  it('keeps the cart on failure, retries the same request, then uses the server receipt', async () => {
    const onOrderPlaced = vi.fn();
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    checkout.placeOrder.mockResolvedValueOnce({ success: false, error: 'Database unavailable' }).mockResolvedValueOnce({
      success: true, order: { id: 'abcdef00-0000-4000-8000-000000000001', created_at: '2026-10-07T12:00:00Z', total: 10, items: [{ id: 194, name: 'Organic Cow Curd (Dahi) (1kg)', price: 10, quantity: 1 }] },
    });
    render(<Cart isOpen onClose={vi.fn()} cartItems={[{ id: 194, name: 'Dahi', price: 10, quantity: 1 }]} removeFromCart={vi.fn()} updateQuantity={vi.fn()} onOrderPlaced={onOrderPlaced} />);
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Place Order via WhatsApp' })));
    expect(screen.getByRole('alert')).toHaveTextContent('Database unavailable');
    expect(onOrderPlaced).not.toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
    expect(localStorage.getItem('orderHistory')).toBeNull();
    const firstRequest = checkout.placeOrder.mock.calls[0][4];
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Place Order via WhatsApp' })));
    expect(checkout.placeOrder.mock.calls[1][4]).toBe(firstRequest);
    expect(checkout.placeOrder.mock.calls[1][3]).toEqual({ phone: '971500000000', name: 'Checkout Test', address: 'Test address in Abu Dhabi' });
    expect(onOrderPlaced).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('PJ-ABCDEF00');
    expect(screen.getByRole('link', { name: 'Continue to WhatsApp' })).toHaveAttribute('href', expect.stringContaining('PJ-ABCDEF00'));
    expect(JSON.parse(localStorage.getItem('orderHistory'))[0].id).toBe('abcdef00-0000-4000-8000-000000000001');
  });
});
