import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';

/**
 * Sticky summary above bottom nav when cart has items (mobile only).
 */
const MobileCartBar = ({ itemCount, total, onOpenCart }) => {
  const visible = itemCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="md:hidden fixed left-3 right-3 z-[45] safe-area-bottom"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <button
            type="button"
            onClick={onOpenCart}
            className="w-full flex items-center justify-between gap-3 bg-brand-charcoal dark:bg-brand-orange text-white rounded-2xl px-4 py-3 shadow-bar border border-brand-gold/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 shrink-0">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-brand-gold text-brand-charcoal text-[10px] font-bold flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              </span>
              <div className="text-left min-w-0">
                <p className="text-xs text-white/70 font-medium truncate">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in cart
                </p>
                <p className="text-base font-bold tabular-nums">
                  AED {Number(total).toFixed(total % 1 === 0 ? 0 : 2)}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-sm font-semibold shrink-0 bg-brand-orange dark:bg-white dark:text-brand-charcoal px-3 py-2 rounded-xl">
              View
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCartBar;
