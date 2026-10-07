import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminProvider, useAdmin } from './AdminContext';
const state = vi.hoisted(() => ({ user: null, client: null, rpc: vi.fn() }));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: state.user }) }));
vi.mock('../lib/supabase', () => ({ get supabase() { return state.client; } }));
function Probe() {
  const { isAdmin, checkAdminCode } = useAdmin();
  return <><span data-testid="admin">{String(isAdmin)}</span><button onClick={() => checkAdminCode('papakiwebsite')}>Old code</button></>;
}
describe('verified administrator access', () => {
  beforeEach(() => { state.user = null; state.client = null; state.rpc.mockReset(); });
  it('does not trust a forged local admin session', async () => {
    localStorage.setItem('admin_session', JSON.stringify({ expiry: '2099-01-01' }));
    render(<AdminProvider><Probe /></AdminProvider>);
    await act(async () => screen.getByText('Old code').click());
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
  });
  it('requires the database to verify the signed-in account', async () => {
    state.user = { id: 'verified-id', email: 'owner@example.test' };
    state.client = { rpc: state.rpc };
    state.rpc.mockResolvedValue({ data: false, error: null });
    render(<AdminProvider><Probe /></AdminProvider>);
    await waitFor(() => expect(state.rpc).toHaveBeenCalledWith('is_store_admin'));
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
  });
  it('allows an authenticated account only after a positive role check', async () => {
    state.user = { id: 'verified-id', email: 'owner@example.test' };
    state.client = { rpc: state.rpc };
    state.rpc.mockResolvedValue({ data: true, error: null });
    render(<AdminProvider><Probe /></AdminProvider>);
    await waitFor(() => expect(screen.getByTestId('admin')).toHaveTextContent('true'));
  });
  it('fails closed when the role query fails', async () => {
    state.user = { id: 'verified-id', email: 'owner@example.test' };
    state.client = { rpc: state.rpc };
    state.rpc.mockResolvedValue({ data: null, error: new Error('offline') });
    render(<AdminProvider><Probe /></AdminProvider>);
    await waitFor(() => expect(state.rpc).toHaveBeenCalled());
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
  });
});
