import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationProvider, useNotifications } from './NotificationContext';

const mocks = vi.hoisted(() => ({ from: vi.fn(), eq: vi.fn(), update: vi.fn() }));
vi.mock('../lib/supabase', () => ({ supabase: { from: mocks.from } }));
function Probe() {
  const n = useNotifications();
  return <><p>{n.notifications.map(x => x.body).join(',')}</p><output>{n.unreadCount}</output><button onClick={() => n.markAsRead('n1')}>Read</button><button onClick={() => n.deleteNotification('n1')}>Dismiss</button></>;
}
describe('public store broadcasts', () => {
  beforeEach(() => {
    const q = { select: vi.fn().mockReturnThis(), eq: mocks.eq.mockReturnThis(), order: vi.fn().mockReturnThis(), limit: vi.fn().mockResolvedValue({ data: [{ id: 'n1', title: 'Back in stock', body: 'Fresh paneer is available', target: 'all' }], error: null }), update: mocks.update };
    mocks.from.mockReturnValue(q);
  });
  it('loads broadcasts for guests using the real schema and never changes shared read state', async () => {
    const view = render(<NotificationProvider><Probe /></NotificationProvider>);
    await screen.findByText('Fresh paneer is available');
    expect(mocks.eq).toHaveBeenCalledWith('target', 'all');
    expect(screen.getByRole('status')).toHaveTextContent('1');
    fireEvent.click(screen.getByText('Read'));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('0'));
    expect(mocks.update).not.toHaveBeenCalled();
    view.unmount();
    render(<NotificationProvider><Probe /></NotificationProvider>);
    await screen.findByText('Fresh paneer is available');
    expect(screen.getByRole('status')).toHaveTextContent('0');
    fireEvent.click(screen.getByText('Dismiss'));
    await waitFor(() => expect(screen.queryByText('Fresh paneer is available')).not.toBeInTheDocument());
  });
});
