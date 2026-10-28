import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { loadStoreCatalog } from './lib/catalogApi';
vi.mock('./lib/catalogApi', () => ({ loadStoreCatalog: vi.fn(async () => null), loadDailyFeatureIds: async () => null }));

vi.mock('framer-motion', () => {
  const React = require('react');
  const stripMotionProps = ({
    children,
    initial: _initial,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    whileInView: _whileInView,
    whileHover: _whileHover,
    whileTap: _whileTap,
    viewport: _viewport,
    ...props
  }) => React.createElement('div', props, children);

  return {
    AnimatePresence: ({ children }) => children,
    motion: {
      button: stripMotionProps,
      div: stripMotionProps,
    },
  };
});

vi.mock('./components/Navbar', () => ({ default: ({ toggleTheme }) => <button onClick={toggleTheme}>Toggle theme</button> }));
vi.mock('./components/Hero', () => ({ default: () => null }));
vi.mock('./components/ProductCard', () => ({ default: () => null }));
vi.mock('./components/Footer', () => ({ default: () => null }));
vi.mock('./components/FloatingWhatsApp', () => ({ default: () => null }));
vi.mock('./components/Toast', () => ({ default: () => null }));
vi.mock('./components/BottomNav', () => ({ default: () => null }));
vi.mock('./components/MobileCartBar', () => ({ default: () => null }));
vi.mock('./components/OurStore', () => ({ default: () => null }));
vi.mock('./components/OfferTicker', () => ({ default: () => null }));
vi.mock('./components/OffersRail', () => ({ default: () => null }));
vi.mock('./components/PromotionalOfferModal', () => ({
  default: ({ isOpen, product }) =>
    isOpen ? <div role="dialog">{product.name} promotional offer</div> : null,
}));

vi.mock('./context/LanguageContext', () => ({
  useLanguage: () => ({ t: (key) => key }),
}));
vi.mock('./context/AdminContext', () => ({
  useAdmin: () => ({ isAdmin: false }),
}));
vi.mock('./context/AuthContext', () => ({
  useAuth: () => ({ isLoggedIn: false, customer: null, logout: vi.fn() }),
}));

describe('promotional offer scheduling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    loadStoreCatalog.mockResolvedValue(null);
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.classList.remove('dark');
  });

  it('opens the milk promotion on every page load even when an old session flag exists', async () => {
    sessionStorage.setItem('promotion_seen_193', 'true');

    render(<App />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByRole('dialog')).toHaveTextContent(
      'Organic Fresh Milk (1.5L) promotional offer'
    );
  });

  it('keeps milk as the opening campaign when the backend still contains the older dahi popup flag', async () => {
    loadStoreCatalog.mockResolvedValue([
      { id: 194, name: 'Organic Cow Curd (Dahi) (1kg)', price: 10, promotionalPopup: true },
      { id: 193, name: 'Organic Fresh Milk (1.5L)', price: 21, compareAtPrice: 25 },
    ]);
    render(<App />);
    await act(async () => {});
    await act(async () => { vi.advanceTimersByTime(1100); });
    expect(screen.getByRole('dialog')).toHaveTextContent('Organic Fresh Milk (1.5L) promotional offer');
  });

  it('starts in light mode on a dark device and enables dark only after a manual toggle', async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ matches: query.includes('prefers-color-scheme: dark'), media: query, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    const { unmount } = render(<App />);
    await act(async () => {});
    expect(document.documentElement).not.toHaveClass('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Toggle theme' }));
    expect(document.documentElement).toHaveClass('dark');
    unmount();
    render(<App />);
    expect(document.documentElement).not.toHaveClass('dark');
  });
});
