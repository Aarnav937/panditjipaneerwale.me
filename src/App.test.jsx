import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

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

vi.mock('./components/Navbar', () => ({ default: () => null }));
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
  });

  afterEach(() => {
    vi.useRealTimers();
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
});
