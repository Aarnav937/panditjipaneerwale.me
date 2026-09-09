import React from 'react';
import { X, Heart, ShoppingBag, Info, Award, Leaf, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useWishlist } from '../context/WishlistContext';
import { formatAed, getSaleInfo } from '../lib/pricing';

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23FFF8F2' width='300' height='200'/%3E%3Ctext x='150' y='100' text-anchor='middle' fill='%23D4AF37' font-family='sans-serif' font-size='14' font-weight='700'%3E🧀 Pandit Ji Fresh%3C/text%3E%3C/svg%3E";

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

  const whatsappInquiryUrl = 'https://wa.me/971524676306?text=' + encodeURIComponent(`Hello Pandit Ji Paneer Wale, I am interested in "${product.name}" (AED ${formatAed(sale.price)}). Is this available for delivery in Abu Dhabi?`);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[85] flex items-end md:items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-white/10 flex flex-col md:flex-row z-10 max-h-[92dvh] md:max-h-[85vh]"
          >
            <div className="absolute top-0 left-0 right-0 accent-gold-line" />

            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-30 p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-all shadow-sm"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Plate */}
            <div className="relative w-full md:w-1/2 image-plate p-6 flex items-center justify-center min-h-[220px] md:min-h-full border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/10">
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={imageSrc}
                alt={product.name}
                className="max-h-[200px] md:max-h-[280px] w-auto object-contain"
              />

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute bottom-4 left-4 p-2.5 rounded-full shadow-md transition-all ${
                  isWishlisted
                    ? 'bg-red-500 text-white shadow-red-500/30'
                    : 'bg-white dark:bg-slate-800 text-gray-400 hover:text-red-500'
                }`}
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              <span className="absolute bottom-4 right-4 bg-white/95 dark:bg-slate-800/95 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] uppercase tracking-wider px-3 py-1 rounded-full border border-amber-500/20 shadow-sm">
                {product.category || 'Pure Dairy'}
              </span>
            </div>

            {/* Product Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-brand-charcoal dark:text-white leading-snug">
                    {product.name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> 100% Pure & Authentic
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">•</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Leaf className="w-3.5 h-3.5" /> No Preservatives
                    </span>
                  </div>
                </div>

                <div className="border-y border-gray-100 dark:border-white/10 py-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-brand-orange dark:text-amber-400 tabular-nums">
                        AED {formatAed(sale.price)}
                      </span>
                      {sale.onSale && (
                        <span className="line-through text-xs text-gray-400 font-bold">
                          AED {formatAed(sale.compareAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Availability</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isAvailable ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {isAvailable ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] text-gray-400 font-black uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Product Details
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {product.description || 'Premium quality dairy product prepared fresh with traditional purity standards for your home.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2.5">
                <button
                  onClick={() => {
                    addToCart(product);
                    onClose();
                  }}
                  disabled={!isAvailable}
                  className={`w-full min-h-[48px] font-black text-sm py-3 px-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md ${
                    isAvailable
                      ? 'bg-gradient-to-r from-brand-orange to-amber-500 hover:from-brand-orangeDark hover:to-amber-600 text-white shadow-brand-orange/25'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isAvailable ? (t('add') || 'Add to Bag') : 'Unavailable'}</span>
                </button>

                <a
                  href={whatsappInquiryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[42px] font-bold text-xs py-2.5 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 border border-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
