import React, { useState } from 'react';
import { Heart, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23FFF6F0' width='300' height='200'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='%23D4AF37' font-family='sans-serif' font-size='13'%3EProduct%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product, addToCart, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const imageSrc = imageError || product.image?.includes('placeholder')
    ? FALLBACK_IMAGE
    : product.image;
  const isAvailable = product.is_available !== false && (product.stock_quantity === undefined || product.stock_quantity > 0);

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(product)}
      className={`group relative flex flex-col bg-white dark:bg-brand-card border border-brand-border/80 dark:border-gray-800 rounded-2xl shadow-soft hover:shadow-soft-hover overflow-hidden transition-all duration-300 cursor-pointer ${!isAvailable ? 'opacity-70' : ''}`}
    >
      {/* Quiet gold → saffron accent */}
      <div className="accent-gold-line opacity-70" />

      {/* Image plate — flat cream helps uneven photos look intentional */}
      <div className="relative h-48 sm:h-52 w-full image-plate overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-brand-saffronLight/80 dark:bg-gray-800 animate-pulse" />
        )}

        <img
          src={imageSrc}
          alt={product.name}
          className={`relative z-[1] w-full h-full object-contain p-4 transition-all duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-[1.03]`}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 left-3 z-10 p-2 rounded-full shadow-soft transition-all duration-200 ${isWishlisted
            ? 'bg-brand-saffron text-white'
            : 'bg-white/95 dark:bg-gray-800 text-gray-400 hover:text-brand-saffron'
            }`}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {!isAvailable && (
          <div className="absolute inset-0 z-10 bg-black/45 flex items-center justify-center">
            <span className="bg-brand-saffron text-white px-3 py-1.5 rounded-full font-semibold text-xs tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-goldDark dark:text-brand-gold">
          {product.category || 'Fresh'}
        </p>

        <h3 className="text-base font-semibold text-brand-charcoal dark:text-white leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-brand-muted font-medium">AED</span>
            <span className="text-xl font-bold text-brand-saffron tabular-nums">
              {product.price}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            disabled={!isAvailable}
            aria-label={isAvailable ? `Add ${product.name} to cart` : 'Unavailable'}
            className={`inline-flex items-center justify-center gap-1.5 min-w-[7.5rem] font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-[0.97] ${isAvailable
              ? 'bg-brand-orange hover:bg-brand-dark text-white shadow-sm'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
          >
            {isAvailable ? (
              <>
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>{t('add')}</span>
              </>
            ) : (
              <span>Unavailable</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
