import React from 'react';
import { X, Heart, ShoppingBag, Info, Award, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { formatAed, getSaleInfo } from '../lib/pricing';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='95' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EProduct Image%3C/text%3E%3Cpath d='M130 110 L150 90 L170 110 L160 110 L160 130 L140 130 L140 110 Z' fill='%23d1d5db'/%3E%3C/svg%3E";

const QuickViewModal = ({ product, isOpen, onClose, addToCart }) => {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const isAvailable = product.is_available !== false && (product.stock_quantity === undefined || product.stock_quantity > 0);
  const sale = getSaleInfo(product);

  const imageSrc = product.image?.includes('placeholder') || !product.image
    ? FALLBACK_IMAGE
    : product.image;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[85] flex items-end md:items-center justify-center p-0 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 md:backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-3xl bg-white dark:bg-brand-card rounded-t-3xl md:rounded-2xl overflow-hidden shadow-soft-hover border border-brand-border dark:border-gray-700 flex flex-col md:flex-row z-10 max-h-[92dvh] md:max-h-[80vh]"
          >
            <div className="md:hidden mx-auto mt-2 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" aria-hidden />
            <div className="absolute top-0 left-0 right-0 accent-gold-line" />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 dark:bg-black/50 text-brand-muted hover:text-brand-saffron transition-all shadow-soft"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative w-full md:w-1/2 image-plate p-6 flex items-center justify-center min-h-[240px] md:min-h-full border-b md:border-b-0 md:border-r border-brand-border/60 dark:border-gray-800">
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 }}
                src={imageSrc}
                alt={product.name}
                className="max-h-[220px] md:max-h-[320px] w-auto object-contain"
              />

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute bottom-4 left-4 p-2.5 rounded-full shadow-soft transition-all ${
                  isWishlisted
                    ? 'bg-brand-saffron text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-brand-saffron'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              <span className="absolute bottom-4 right-4 bg-white/95 dark:bg-gray-900/90 text-brand-goldDark dark:text-brand-gold font-semibold text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full border border-brand-gold/25">
                {product.category || 'Fresh'}
              </span>
            </div>

            <div className="w-full md:w-1/2 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-brand-charcoal dark:text-white leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="font-medium text-brand-goldDark dark:text-brand-gold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Pure & authentic
                    </span>
                    <span className="text-brand-border">·</span>
                    <span className="font-medium text-green-700 dark:text-green-400 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" /> Quality ingredients
                    </span>
                  </div>
                </div>

                <div className="border-t border-b border-brand-border/70 dark:border-gray-800 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-brand-muted font-medium uppercase tracking-wider block">Price</span>
                    <span className="text-2xl font-bold text-brand-saffron tabular-nums">
                      AED {formatAed(sale.price)}
                    </span>
                    {sale.onSale && (
                      <p className="text-xs text-brand-muted">
                        <span className="line-through mr-1">AED {formatAed(sale.compareAt)}</span>
                        <span className="text-brand-saffron font-bold">{sale.percent}% off</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-brand-muted font-medium uppercase tracking-wider block">Status</span>
                    <span className={`text-sm font-semibold ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-brand-saffron'}`}>
                      {isAvailable ? 'In stock' : 'Out of stock'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] text-brand-muted font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Description
                  </h4>
                  <p className="text-sm text-brand-muted dark:text-gray-300 leading-relaxed">
                    {product.description || 'Premium quality product for your kitchen.'}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                  disabled={!isAvailable}
                  className={`w-full min-h-[52px] font-semibold py-3 px-5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] ${
                    isAvailable
                      ? 'bg-brand-orange hover:bg-brand-dark text-white shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{isAvailable ? t('add') : 'Unavailable'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
