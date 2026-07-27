import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AdminDashboard from './AdminDashboard';

vi.mock('../../context/AdminContext', () => ({
  useAdmin: vi.fn(),
}));

vi.mock('./ProductManager', () => ({ default: () => <div>ProductManager</div> }));
vi.mock('./InventoryManager', () => ({ default: () => <div>InventoryManager</div> }));
vi.mock('./CustomerDatabase', () => ({ default: () => <div>CustomerDatabase</div> }));
vi.mock('./NotificationManager', () => ({ default: () => <div>NotificationManager</div> }));
vi.mock('./AnalyticsDashboard', () => ({ default: () => <div>AnalyticsDashboard</div> }));
vi.mock('./ReviewModerator', () => ({ default: () => <div>ReviewModerator</div> }));

vi.mock('framer-motion', () => {
  const React = require('react');
  const passthrough = ({ children, ...props }) =>
    React.createElement('div', props, children);
  return {
    motion: {
      div: passthrough,
      button: ({ children, ...props }) => React.createElement('button', props, children),
    },
    AnimatePresence: ({ children }) => children,
  };
});

import { useAdmin } from '../../context/AdminContext';

describe('AdminDashboard gate', () => {
  it('renders nothing when not admin', () => {
    useAdmin.mockReturnValue({
      isAdmin: false,
      logoutAdmin: vi.fn(),
      getSessionTimeRemaining: vi.fn(),
    });

    const { container } = render(<AdminDashboard isOpen onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows admin chrome and default analytics tab when admin', () => {
    useAdmin.mockReturnValue({
      isAdmin: true,
      logoutAdmin: vi.fn(),
      getSessionTimeRemaining: () => 120,
    });

    render(<AdminDashboard isOpen onClose={vi.fn()} />);
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AnalyticsDashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
  });
});
