import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AdminProvider, useAdmin } from './AdminContext';

/**
 * When VITE_ADMIN_SECRET is unset in the test env, AdminContext falls back to
 * its compile-time default. Tests assert unlock behavior, not the secret value.
 * Production should always set VITE_ADMIN_SECRET via .env / GitHub Secrets.
 */
const SECRET = import.meta.env.VITE_ADMIN_SECRET || 'papakiwebsite';

function Probe() {
  const { isAdmin, checkAdminCode, logoutAdmin } = useAdmin();
  return (
    <div>
      <span data-testid="admin">{String(isAdmin)}</span>
      <button type="button" onClick={() => checkAdminCode(`near ${SECRET} please`)}>
        try-code
      </button>
      <button type="button" onClick={() => checkAdminCode('wrong phrase only')}>
        try-bad
      </button>
      <button type="button" onClick={() => logoutAdmin()}>
        logout
      </button>
    </div>
  );
}

describe('AdminContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts non-admin', () => {
    render(
      <AdminProvider>
        <Probe />
      </AdminProvider>
    );
    expect(screen.getByTestId('admin').textContent).toBe('false');
  });

  it('grants admin when secret appears in text', async () => {
    render(
      <AdminProvider>
        <Probe />
      </AdminProvider>
    );

    await act(async () => {
      screen.getByText('try-code').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin').textContent).toBe('true');
    });
    expect(localStorage.getItem('admin_session')).toBeTruthy();
  });

  it('rejects wrong code', async () => {
    render(
      <AdminProvider>
        <Probe />
      </AdminProvider>
    );

    await act(async () => {
      screen.getByText('try-bad').click();
    });

    expect(screen.getByTestId('admin').textContent).toBe('false');
  });

  it('logout clears session', async () => {
    render(
      <AdminProvider>
        <Probe />
      </AdminProvider>
    );

    await act(async () => {
      screen.getByText('try-code').click();
    });
    await waitFor(() => expect(screen.getByTestId('admin').textContent).toBe('true'));

    await act(async () => {
      screen.getByText('logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('admin').textContent).toBe('false');
      expect(localStorage.getItem('admin_session')).toBeNull();
    });
  });

  it('restores valid session from localStorage', async () => {
    const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    localStorage.setItem('admin_session', JSON.stringify({ expiry }));

    render(
      <AdminProvider>
        <Probe />
      </AdminProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin').textContent).toBe('true');
    });
  });
});
