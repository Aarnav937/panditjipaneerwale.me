import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { formatAed, getSaleInfo } from '../lib/pricing';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23FFF6F0' width='300' height='200'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='%23D4AF37' font-family='sans-serif' font-size='13'%3EProduct%3C/text%3E%3C/svg%3E";

const ProductCard = ({ product, addToCart, onViewDetails }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const reduceMotion = useReducedMotion();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const imageSrc = imageError || product.image?.includes('placeholder')
    ? FALLBACK_IMAGE
    : product.image;
  const isAvailable = product.is_available !== false && (product.stock_quantity === undefined || product.stock_quantity > 0);
  const sale = getSaleInfo(product);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 650);
  };

  return (
    <motion.div
      onClick={() => onViewDetails && onViewDetails(product)}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.012 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 360, damping: 24 }}
      className={`group relative flex flex-col h-full bg-white dark:bg-brand-card border border-brand-border/70 dark:border-gray-800 rounded-2xl shadow-gold-glow shadow-gold-glow-hover overflow-hidden cursor-pointer ${!isAvailable ? 'opacity-70' : ''}`}
    >
      <div className="accent-gold-line" />

      <div className="relative h-28 sm:h-48 w-full image-plate overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-saffronLight via-orange-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
        )}

        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`product-cutout relative z-[1] w-full h-full object-contain p-2.5 sm:p-4 transition-transform duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'} md:group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />

        {sale.onSale && (
          <span className="absolute top-2 right-2 z-10 bg-brand-saffron text-white text-[10px] font-extrabold uppercase tracking-wide px-2 py-1 rounded-full shadow">
            {sale.percent}% off
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 left-2 z-10 min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 p-2 rounded-full shadow-md transition-colors duration-200 ${isWishlisted
            ? 'bg-brand-saffron text-white'
            : 'bg-white/95 dark:bg-gray-800 text-gray-400'
            }`}
        >
          <Heart className="w-4 h-4 mx-auto" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {!isAvailable && (
          <div className="absolute inset-0 z-10 bg-black/45 flex items-center justify-center">
            <span className="bg-brand-saffron text-white px-3 py-1.5 rounded-full font-semibold text-xs tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-4 flex flex-col flex-grow gap-1">
        <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-brand-goldDark dark:text-brand-gold truncate">
          {product.category || 'Fresh'}
        </p>

        <h3 className="text-[13px] sm:text-base font-bold text-brand-charcoal dark:text-white leading-snug line-clamp-2 min-h-[2.4em]">
          {product.name}
        </h3>

        <div className="mt-auto pt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            {sale.onSale && (
              <p className="text-[11px] text-brand-muted line-through tabular-nums leading-none mb-0.5">
                AED {formatAed(sale.compareAt)}
              </p>
            )}
            <p className="flex items-baseline gap-1 leading-none">
              <span className="text-[10px] uppercase tracking-wider text-brand-muted font-semibold">AED</span>
              <span className="text-lg sm:text-xl font-extrabold text-brand-saffron tabular-nums">
                {formatAed(sale.price)}
              </span>
            </p>
          </div>

          <motion.button
            type="button"
            whileTap={isAvailable && !reduceMotion ? { scale: 0.92 } : undefined}
            onClick={handleAdd}
            disabled={!isAvailable}
            aria-label={isAvailable ? `Add ${product.name} to cart` : 'Unavailable'}
            className={`inline-flex items-center justify-center gap-1 min-h-[44px] w-full sm:w-auto sm:min-w-[7.5rem] font-bold py-2 px-3 rounded-xl transition-colors ${justAdded ? 'just-added' : ''} ${isAvailable
              ? 'text-white shadow-md shadow-brand-orange/30'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            style={isAvailable ? {
              background: justAdded
                ? 'linear-gradient(135deg, #16a34a, #22c55e)'
                : 'linear-gradient(135deg, #FF8C00, #E25822)',
            } : undefined}
          >
            {isAvailable ? (
              <>
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                <span>{justAdded ? 'Added!' : t('add')}</span>
              </>
            ) : (
              <span>Unavailable</span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
