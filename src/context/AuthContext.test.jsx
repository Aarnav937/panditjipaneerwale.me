import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../lib/supabase', () => ({
  supabase: null,
  db: {
    customers: {
      getByPhone: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    orders: {
      create: vi.fn(),
      getByPhone: vi.fn(),
    },
  },
}));

function Probe() {
  const { isLoggedIn, customer, loginAsGuest, logout } = useAuth();
  return (
    <div>
      <span data-testid="logged">{String(!!isLoggedIn)}</span>
      <span data-testid="name">{customer?.name || ''}</span>
      <span data-testid="phone">{customer?.phone || ''}</span>
      <button
        type="button"
        onClick={() => loginAsGuest('971500000000', 'Test User', 'Shop Road')}
      >
        guest
      </button>
      <button type="button" onClick={() => logout()}>
        logout
      </button>
    </div>
  );
}

describe('AuthContext guest flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in as guest via localStorage without Supabase', async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByTestId('logged').textContent).toBe('false');

    await act(async () => {
      screen.getByText('guest').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged').textContent).toBe('true');
      expect(screen.getByTestId('name').textContent).toBe('Test User');
      expect(screen.getByTestId('phone').textContent).toBe('971500000000');
    });

    expect(localStorage.getItem('customerPhone')).toBe('971500000000');
    expect(localStorage.getItem('customerName')).toBe('Test User');
  });

  it('restores guest from localStorage on mount', async () => {
    localStorage.setItem('customerPhone', '971511111111');
    localStorage.setItem('customerName', 'Saved Guest');
    localStorage.setItem('customerAddress', 'Old Street');

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('phone').textContent).toBe('971511111111');
      expect(screen.getByTestId('name').textContent).toBe('Saved Guest');
    });
  });

  it('logout clears guest state', async () => {
    localStorage.setItem('customerPhone', '971522222222');
    localStorage.setItem('customerName', 'Bye');
    localStorage.setItem('customerAddress', 'X');

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('name').textContent).toBe('Bye');
    });

    await act(async () => {
      screen.getByText('logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('logged').textContent).toBe('false');
      expect(localStorage.getItem('customerPhone')).toBeNull();
    });
  });
});
