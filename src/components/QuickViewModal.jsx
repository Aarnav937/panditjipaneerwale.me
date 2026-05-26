import React from 'react';
import { X, Heart, ShoppingBag, Info, Award, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23f3f4f6' width='300' height='200'/%3E%3Ctext x='150' y='95' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'%3EProduct Image%3C/text%3E%3Cpath d='M130 110 L150 90 L170 110 L160 110 L160 130 L140 130 L140 110 Z' fill='%23d1d5db'/%3E%3C/svg%3E";

const QuickViewModal = ({ product, isOpen, onClose, addToCart }) => {
  const { t } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!product) return null;

  const isWishlisted = isInWishlist(product.id);
  const isAvailable = product.is_available !== false && (product.stock_quantity === undefined || product.stock_quantity > 0);

  const imageSrc = product.image?.includes('placeholder') || !product.image
    ? FALLBACK_IMAGE
    : product.image;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="relative w-full max-w-4xl bg-[#FFFDF9] dark:bg-[#1A1A1A] rounded-3xl overflow-hidden shadow-2xl border-2 border-brand-gold/30 dark:border-brand-gold/20 flex flex-col md:flex-row z-10 max-h-[90vh] md:max-h-[80vh]"
          >
            {/* Traditional Indian Top Gold-Saffron Border */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-gold via-brand-saffron to-brand-gold" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 dark:bg-black/60 text-gray-700 dark:text-gray-300 hover:text-brand-saffron hover:scale-110 active:scale-95 transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left: Product Image Section */}
            <div className="relative w-full md:w-1/2 bg-gradient-to-b from-[#FFFDF0] to-[#FFF9EE] dark:from-[#242424] dark:to-[#1E1E1E] p-8 flex items-center justify-center min-h-[300px] md:min-h-full">
              <div className="absolute inset-0 opacity-5 dark:opacity-10 bg-no-repeat bg-center bg-cover heritage-motif pointer-events-none" />
              
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                src={imageSrc}
                alt={product.name}
                className="max-h-[260px] md:max-h-[380px] w-auto object-contain drop-shadow-2xl"
              />

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute bottom-6 left-6 p-3 rounded-full shadow-lg transition-all duration-300 ${
                  isWishlisted
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:scale-110'
                }`}
              >
                <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Category Badge */}
              <span className="absolute bottom-6 right-6 bg-brand-saffron/10 text-brand-saffron dark:bg-brand-saffron/20 dark:text-brand-saffron font-extrabold text-xs px-3.5 py-1.5 rounded-full border border-brand-saffron/20">
                {product.category || 'Fresh'}
              </span>
            </div>

            {/* Right: Info Section */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    {product.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-semibold text-brand-goldDark dark:text-brand-gold flex items-center gap-1">
                      <Award className="w-4 h-4" /> 100% Pure & Authentic
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Leaf className="w-4 h-4" /> Natural Ingredients
                    </span>
                  </div>
                </div>

                <div className="border-t border-b border-gray-100 dark:border-gray-800 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Price</span>
                    <span className="text-3xl font-black text-brand-saffron">
                      AED {product.price}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Availability</span>
                    <span className={`text-sm font-bold ${isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                      {isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs text-gray-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-4 h-4" /> Description
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description || 'Experience premium, high-quality ingredients sourced and packaged with absolute care to bring you the best culinary taste.'}
                  </p>
                </div>

                <div className="bg-[#FFFDF0] dark:bg-[#252525] p-4 rounded-2xl border border-brand-gold/20 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-brand-gold mt-1 flex-shrink-0" />
                  <p>
                    Storage Instructions: Keep refrigerated to retain freshness and aroma. Serve chilled or use straight in cooking for traditional texture.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                  disabled={!isAvailable}
                  className={`flex-1 font-bold py-3.5 px-6 rounded-2xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 ${
                    isAvailable
                      ? 'bg-gradient-to-r from-brand-saffron to-brand-orange hover:from-brand-saffron hover:to-red-500 text-white shadow-saffron/30 hover:shadow-saffron/50'
                      : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
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
