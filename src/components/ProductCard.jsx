import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Heart, Plus, Check, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { formatAed, getSaleInfo } from '../lib/pricing';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23FFF8F2' width='300' height='200'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='%23D4AF37' font-family='sans-serif' font-size='14' font-weight='700'%3E🧀 Pandit Ji Fresh%3C/text%3E%3C/svg%3E";

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
    setTimeout(() => setJustAdded(false), 700);
  };

  return (
    <motion.div
      onClick={() => onViewDetails && onViewDetails(product)}
      whileHover={reduceMotion ? undefined : { y: -6, scale: 1.015 }}
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-amber-400/40 shadow-sm hover:shadow-2xl hover:shadow-brand-orange/15 transition-all duration-300 overflow-hidden cursor-pointer ${
        !isAvailable ? 'opacity-70 grayscale-[30%]' : ''
      }`}
    >
      {/* Top Accent Shimmer Line */}
      <div className="accent-gold-line opacity-75 group-hover:opacity-100 transition-opacity" />

      {/* Image Showcase Plate */}
      <div className="relative h-40 sm:h-52 w-full image-plate overflow-hidden flex items-center justify-center p-3">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/30 dark:from-slate-800 dark:to-slate-900 animate-pulse" />
        )}

        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`product-cutout relative z-[1] w-full h-full object-contain transition-transform duration-500 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          } group-hover:scale-110`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            setImageLoaded(true);
          }}
        />

        {/* Sale / Discount Badge */}
        {sale.onSale && (
          <span className="absolute top-3 right-3 z-10 bg-gradient-to-r from-brand-orange to-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shadow-red-500/25">
            {sale.percent}% OFF
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 left-3 z-10 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all duration-200 ${
            isWishlisted
              ? 'bg-red-500 text-white shadow-red-500/30 scale-105'
              : 'bg-white/95 dark:bg-slate-800/95 text-gray-400 hover:text-red-500 hover:scale-105 backdrop-blur-sm'
          }`}
        >
          <Heart className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Quick View Floating Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-2 z-10 hidden sm:flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 text-white text-[11px] font-bold backdrop-blur-md shadow-lg">
            <Eye className="w-3.5 h-3.5" /> Quick View
          </span>
        </div>

        {/* Out of Stock Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-red-600 text-white px-3.5 py-1.5 rounded-full font-black text-xs tracking-wide shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-grow gap-1.5">
        {/* Category Pill */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 truncate">
            {product.category || 'Pure Dairy'}
          </span>
          <span className="text-[10px] text-gray-400 font-medium hidden sm:inline">Abu Dhabi</span>
        </div>

        {/* Product Name */}
        <h3 className="text-sm sm:text-base font-bold text-brand-charcoal dark:text-white leading-snug line-clamp-2 min-h-[2.6em] group-hover:text-brand-orange transition-colors">
          {product.name}
        </h3>

        {/* Price & Add Action Row */}
        <div className="mt-auto pt-3 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3 border-t border-gray-100 dark:border-white/5">
          <div>
            {sale.onSale && (
              <p className="text-[11px] text-gray-400 line-through tabular-nums leading-none mb-0.5">
                AED {formatAed(sale.compareAt)}
              </p>
            )}
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">AED</span>
              <span className="text-xl sm:text-2xl font-black text-brand-orange dark:text-amber-400 tabular-nums">
                {formatAed(sale.price)}
              </span>
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={isAvailable && !reduceMotion ? { scale: 0.94 } : undefined}
            onClick={handleAdd}
            disabled={!isAvailable}
            aria-label={isAvailable ? `Add ${product.name} to cart` : 'Unavailable'}
            className={`inline-flex items-center justify-center gap-1.5 min-h-[42px] w-full sm:w-auto sm:min-w-[7.5rem] font-black text-xs sm:text-sm py-2 px-3.5 rounded-xl transition-all ${
              justAdded ? 'just-added bg-emerald-600 text-white' : ''
            } ${
              isAvailable
                ? justAdded
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orangeDark hover:to-amber-600 text-white shadow-md shadow-brand-orange/25 hover:shadow-lg'
                : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAvailable ? (
              justAdded ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={3} />
                  <span>{t('added') || 'Added!'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" strokeWidth={3} />
                  <span>{t('add') || 'Add'}</span>
                </>
              )
            ) : (
              <span>{t('outOfStock') || 'Unavailable'}</span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
