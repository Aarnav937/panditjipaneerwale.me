import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key) => key,
    language: 'en',
  }),
}));

vi.mock('../context/WishlistContext', () => ({
  useWishlist: () => ({
    isInWishlist: () => false,
    toggleWishlist: vi.fn(),
  }),
}));

vi.mock('framer-motion', () => {
  const React = require('react');
  const strip = ({
    children,
    whileHover: _h,
    whileTap: _t,
    animate: _a,
    transition: _tr,
    initial: _i,
    exit: _e,
    ...props
  }) => props;
  return {
    motion: {
      div: ({ children, ...rest }) => React.createElement('div', strip(rest), children),
      button: ({ children, ...rest }) => React.createElement('button', strip(rest), children),
    },
    useReducedMotion: () => true,
  };
});

const product = {
  id: 3,
  name: 'Fresh Paneer (500g)',
  category: 'Milk Products',
  price: 15,
  image: 'images/products/product-3.webp',
  description: 'Soft and fresh paneer, perfect for curries.',
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={product} addToCart={vi.fn()} onViewDetails={vi.fn()} />);
    expect(screen.getByText('Fresh Paneer (500g)')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls addToCart when add control is used', () => {
    const addToCart = vi.fn();
    render(<ProductCard product={product} addToCart={addToCart} onViewDetails={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Add Fresh Paneer \(500g\) to cart/i }));
    expect(addToCart).toHaveBeenCalledTimes(1);
    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }));
  });

  it('returns null for missing product', () => {
    const { container } = render(
      <ProductCard product={null} addToCart={vi.fn()} onViewDetails={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });
});
