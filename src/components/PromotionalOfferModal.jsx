import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BadgePercent, Leaf, ShoppingBag, Sparkles, X } from 'lucide-react';
import { formatAed, getSaleInfo } from '../lib/pricing';

const PromotionalOfferModal = ({ product, isOpen, onClose, onAddToCart, onViewProduct }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!product) return null;

  const sale = getSaleInfo(product);

  const handleAddToCart = () => {
    onAddToCart?.(product);
    onClose?.();
  };

  const handleViewProduct = () => {
    onViewProduct?.(product);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="Dismiss promotional offer"
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-md cursor-default"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} launch offer`}
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-emerald-300/30 bg-white shadow-2xl shadow-emerald-950/30 dark:bg-slate-950"
          >
            <button
              type="button"
              aria-label="Close promotional offer"
              onClick={onClose}
              className="absolute right-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/50 bg-white/90 text-slate-700 shadow-lg backdrop-blur transition hover:scale-105 hover:text-red-500 dark:border-white/10 dark:bg-slate-900/90 dark:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid md:grid-cols-[0.88fr_1.12fr]">
              <div className="relative min-h-[290px] overflow-hidden bg-gradient-to-br from-emerald-50 via-lime-50 to-amber-50 p-7 sm:min-h-[390px] sm:p-10 dark:from-emerald-950/60 dark:via-slate-900 dark:to-amber-950/30">
                <div className="absolute -left-16 -top-16 h-52 w-52 rounded-full bg-lime-300/30 blur-3xl" />
                <div className="absolute -bottom-16 -right-12 h-52 w-52 rounded-full bg-emerald-400/25 blur-3xl" />
                <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-white/85 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-emerald-700 shadow-sm backdrop-blur dark:bg-slate-900/80 dark:text-emerald-300">
                  <Leaf className="h-3.5 w-3.5 fill-current" /> Fresh & organic
                </div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="relative z-10 mx-auto h-[255px] w-full object-contain drop-shadow-[0_24px_25px_rgba(15,80,55,0.22)] sm:h-[350px]"
                />
              </div>

              <div className="flex flex-col justify-center p-7 sm:p-10">
                <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-brand-orange to-red-500 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-orange-500/20">
                  <Sparkles className="h-3.5 w-3.5" /> New launch special
                </div>

                <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                  Limited promotional offer
                </p>
                <h2 className="font-display text-3xl font-extrabold leading-tight text-brand-charcoal dark:text-white sm:text-4xl">
                  {product.name}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Creamy, wholesome organic milk for tea, coffee, breakfast and everyday family
                  goodness.
                </p>

                <div className="my-6 flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-black tracking-tight text-brand-orange">
                    AED {formatAed(sale.price)}
                  </span>
                  {sale.onSale && (
                    <>
                      <span className="pb-1 text-lg font-bold text-slate-400 line-through">
                        AED {formatAed(sale.compareAt)}
                      </span>
                      <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-black text-red-600 dark:bg-red-500/10 dark:text-red-400">
                        <BadgePercent className="h-3.5 w-3.5" /> {sale.percent}% OFF
                      </span>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  aria-label={`Add ${product.name.replace(/ \([\d.]+L\)$/, '')} to cart`}
                  onClick={handleAddToCart}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-orange to-red-500 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-0.5 hover:brightness-105 active:translate-y-0"
                >
                  <ShoppingBag className="h-4.5 w-4.5" /> Add to cart for AED{' '}
                  {formatAed(sale.price)}
                </button>
                <button
                  type="button"
                  aria-label="View product details"
                  onClick={handleViewProduct}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300"
                >
                  View product details <ArrowRight className="h-4 w-4" />
                </button>

                <p className="mt-4 text-center text-[11px] font-medium text-slate-400">
                  Free same-day delivery across Abu Dhabi
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionalOfferModal;
