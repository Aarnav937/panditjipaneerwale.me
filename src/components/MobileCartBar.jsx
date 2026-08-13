import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ChevronRight } from 'lucide-react';

const MobileCartBar = ({ itemCount, total, onOpenCart }) => {
  const visible = itemCount > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 320 }}
          className="md:hidden fixed left-3 right-3 z-[45] safe-area-bottom"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <motion.button
            type="button"
            onClick={onOpenCart}
            whileTap={{ scale: 0.97 }}
            className="cart-bar-live w-full flex items-center justify-between gap-3 text-white rounded-2xl px-4 py-3.5 border border-white/20"
            style={{
              background: 'linear-gradient(135deg, #1C1917 0%, #2a1810 40%, #E25822 160%)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <motion.span
                key={itemCount}
                initial={{ scale: 0.7 }}
                animate={{ scale: 1 }}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-brand-orange to-brand-saffron shrink-0 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 min-w-[1.2rem] h-[1.2rem] px-1 rounded-full bg-brand-gold text-brand-charcoal text-[10px] font-extrabold flex items-center justify-center shadow">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              </motion.span>
              <div className="text-left min-w-0">
                <p className="text-xs text-white/75 font-medium truncate">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} ready
                </p>
                <p className="text-lg font-extrabold tabular-nums tracking-tight">
                  AED {Number(total).toFixed(total % 1 === 0 ? 0 : 2)}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-0.5 text-sm font-bold shrink-0 bg-white text-brand-charcoal px-3.5 py-2.5 rounded-xl shadow-md">
              Order
              <ChevronRight className="w-4 h-4" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCartBar;
