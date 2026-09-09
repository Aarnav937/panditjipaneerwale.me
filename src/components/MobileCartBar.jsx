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
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="md:hidden fixed left-3 right-3 z-[45] safe-area-bottom"
          style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <motion.button
            type="button"
            onClick={onOpenCart}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-between gap-3 text-white rounded-2xl px-4 py-3 border border-white/20 shadow-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #111827 0%, #1F2937 40%, #E64D00 130%)',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-amber-500 shrink-0 shadow-md">
                <ShoppingCart className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 min-w-[1.2rem] h-[1.2rem] px-1 rounded-full bg-white text-brand-orange text-[10px] font-black flex items-center justify-center shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] text-amber-200 font-bold truncate flex items-center gap-1">
                  <span>{itemCount} {itemCount === 1 ? 'item' : 'items'} in Bag</span>
                  <span>•</span>
                  <span>Free Delivery</span>
                </p>
                <p className="text-base font-black tabular-nums tracking-tight text-white">
                  AED {Number(total).toFixed(total % 1 === 0 ? 0 : 2)}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-black shrink-0 bg-white text-brand-charcoal px-3.5 py-2 rounded-xl shadow-md">
              <span>Checkout</span>
              <ChevronRight className="w-3.5 h-3.5 text-brand-orange" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileCartBar;
