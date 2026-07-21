import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Plus, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

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
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`group relative flex flex-col bg-white dark:bg-brand-card border border-brand-border/70 dark:border-gray-800 rounded-2xl shadow-gold-glow shadow-gold-glow-hover overflow-hidden cursor-pointer ${!isAvailable ? 'opacity-70' : ''}`}
    >
      <div className="accent-gold-line" />

      <div className="relative h-48 sm:h-52 w-full image-plate overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-brand-saffronLight via-orange-50 to-amber-100 dark:from-gray-800 dark:to-gray-900 animate-pulse" />
        )}

        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`relative z-[1] w-full h-full object-contain p-4 transition-all duration-500 ease-out ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-110 group-hover:-rotate-1`}
          onLoad={() => setImageLoaded(true)}
          onError={() => { setImageError(true); setImageLoaded(true); }}
        />

        {/* Shine sweep on hover */}
        <div className="pointer-events-none absolute inset-0 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 group-hover:translate-x-[220%] transition-transform duration-700 ease-out" />
        </div>

        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 left-3 z-10 p-2.5 rounded-full shadow-md transition-colors duration-200 ${isWishlisted
            ? 'bg-brand-saffron text-white'
            : 'bg-white/95 dark:bg-gray-800 text-gray-400 hover:text-brand-saffron'
            }`}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </motion.button>

        <span className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
          <span className="inline-flex items-center gap-1 bg-brand-charcoal/85 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Sparkles className="w-3 h-3 text-brand-gold" /> View
          </span>
        </span>

        {!isAvailable && (
          <div className="absolute inset-0 z-10 bg-black/45 flex items-center justify-center">
            <span className="bg-brand-saffron text-white px-3 py-1.5 rounded-full font-semibold text-xs tracking-wide">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow gap-1.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-goldDark dark:text-brand-gold">
          {product.category || 'Fresh'}
        </p>

        <h3 className="text-base font-bold text-brand-charcoal dark:text-white leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-brand-saffron transition-colors duration-300">
          {product.name}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-brand-muted font-semibold">AED</span>
            <span className="text-xl font-extrabold text-brand-saffron tabular-nums">
              {product.price}
            </span>
          </div>

          <motion.button
            whileHover={isAvailable ? { scale: 1.05 } : undefined}
            whileTap={isAvailable ? { scale: 0.92 } : undefined}
            animate={justAdded ? { scale: [1, 1.12, 1] } : {}}
            onClick={handleAdd}
            disabled={!isAvailable}
            aria-label={isAvailable ? `Add ${product.name} to cart` : 'Unavailable'}
            className={`inline-flex items-center justify-center gap-1.5 min-w-[7.5rem] font-bold py-2.5 px-4 rounded-xl transition-shadow duration-200 ${isAvailable
              ? 'text-white shadow-md shadow-brand-orange/30 hover:shadow-lg hover:shadow-brand-orange/40'
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
                <Plus className={`w-4 h-4 ${justAdded ? '' : ''}`} strokeWidth={2.5} />
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
