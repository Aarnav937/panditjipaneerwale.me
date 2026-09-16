import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import PromotionalOfferModal from './PromotionalOfferModal';

vi.mock('framer-motion', () => {
  const React = require('react');
  const stripMotionProps = ({
    children,
    initial: _initial,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    ...props
  }) => React.createElement('div', props, children);

  return {
    AnimatePresence: ({ children }) => children,
    motion: {
      div: stripMotionProps,
    },
  };
});

const organicMilk = {
  id: 193,
  name: 'Organic Fresh Milk (1.5L)',
  category: 'Milk Products',
  price: 21,
  compareAtPrice: 25,
  image: 'images/packs/product-193.png',
};

describe('PromotionalOfferModal', () => {
  it('shows the organic milk launch offer with its real prices', () => {
    render(
      <PromotionalOfferModal
        isOpen
        product={organicMilk}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
        onViewProduct={vi.fn()}
      />
    );

    expect(
      screen.getByRole('dialog', { name: /organic fresh milk.*launch offer/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Organic Fresh Milk (1.5L)')).toBeInTheDocument();
    expect(screen.getByText('AED 21')).toBeInTheDocument();
    expect(screen.getByText('AED 25')).toBeInTheDocument();
    expect(screen.getByText('16% OFF')).toBeInTheDocument();
  });

  it('adds the promoted product to the cart and dismisses the popup', () => {
    const onAddToCart = vi.fn();
    const onClose = vi.fn();

    render(
      <PromotionalOfferModal
        isOpen
        product={organicMilk}
        onClose={onClose}
        onAddToCart={onAddToCart}
        onViewProduct={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /add organic fresh milk to cart/i }));
    expect(onAddToCart).toHaveBeenCalledWith(organicMilk);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('opens the regular product view and dismisses the popup', () => {
    const onViewProduct = vi.fn();
    const onClose = vi.fn();

    render(
      <PromotionalOfferModal
        isOpen
        product={organicMilk}
        onClose={onClose}
        onAddToCart={vi.fn()}
        onViewProduct={onViewProduct}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /view product details/i }));
    expect(onViewProduct).toHaveBeenCalledWith(organicMilk);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing without an open offer and supports an explicit close action', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <PromotionalOfferModal
        isOpen={false}
        product={organicMilk}
        onClose={onClose}
        onAddToCart={vi.fn()}
        onViewProduct={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(
      <PromotionalOfferModal
        isOpen
        product={organicMilk}
        onClose={onClose}
        onAddToCart={vi.fn()}
        onViewProduct={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /close promotional offer/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
