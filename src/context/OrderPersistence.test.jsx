import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

const backend = vi.hoisted(() => ({ client: null, create: vi.fn() }));
vi.mock('../lib/supabase', () => ({
  get supabase() { return backend.client; },
  db: { orders: { create: backend.create }, customers: {} },
}));
function Probe() {
  const { placeOrder } = useAuth();
  const [result, setResult] = React.useState(null);
  return <><button onClick={async () => setResult(await placeOrder([{ id: 194, quantity: 1, price: 10 }], 10, 'Morning'))}>Order</button><output>{JSON.stringify(result)}</output></>;
}
import React from 'react';
describe('central order persistence', () => {
  beforeEach(() => { backend.client = null; backend.create.mockReset(); });
  it('does not claim that an order was saved when the backend is disabled', async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await act(async () => screen.getByText('Order').click());
    expect(JSON.parse(screen.getByRole('status').textContent).success).toBe(false);
  });
  it('does not claim success after a database failure', async () => {
    backend.client = { auth: { getSession: async () => ({ data: { session: null } }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }) } };
    backend.create.mockResolvedValue({ data: null, error: new Error('Database unavailable') });
    render(<AuthProvider><Probe /></AuthProvider>);
    await act(async () => screen.getByText('Order').click());
    expect(JSON.parse(screen.getByRole('status').textContent).success).toBe(false);
  });
});
