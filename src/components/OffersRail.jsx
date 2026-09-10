import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { products as defaultProducts } from '../data/products';
import { formatAed, getSaleInfo } from '../lib/pricing';
import { getDailyFeaturedDeals } from '../lib/discounts';

const OffersRail = ({ onOpenProduct, products: propProducts }) => {
  const sourceProducts = propProducts && propProducts.length > 0 ? propProducts : defaultProducts;
  const cards = useMemo(() => getDailyFeaturedDeals(sourceProducts, 8), [sourceProducts]);

  if (cards.length === 0) return null;

  return (
    <section className="relative overflow-hidden py-10 md:py-14 border-y border-amber-500/20 bg-gradient-to-b from-amber-50/60 via-white to-amber-50/40 dark:from-slate-900/80 dark:via-slate-950 dark:to-slate-900/60">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-brand-orange mb-1">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Handpicked Daily Specials</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold text-brand-charcoal dark:text-white tracking-tight">
              Featured <span className="bg-gradient-to-r from-brand-orange to-amber-500 bg-clip-text text-transparent">Abu Dhabi Deals</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Fresh daily batches & top customer favorites in Abu Dhabi with same-day doorstep delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((product) => {
            const sale = getSaleInfo(product);
            return (
              <motion.button
                key={product.id}
                type="button"
                onClick={() => onOpenProduct?.(product)}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="text-left bg-white/95 dark:bg-slate-900/95 rounded-3xl border border-amber-500/20 hover:border-brand-orange/60 dark:border-white/10 dark:hover:border-amber-400/40 p-4 flex gap-3.5 shadow-sm hover:shadow-xl hover:shadow-brand-orange/10 transition-all group cursor-pointer"
              >
                <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden image-plate flex items-center justify-center p-2 relative border border-gray-100 dark:border-white/5">
                  <img src={product.image} alt={product.name} className="product-cutout w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                      sale.onSale 
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}>
                      {sale.onSale ? `${sale.percent}% OFF` : '⭐ Popular'}
                    </span>
                    <p className="font-bold text-xs sm:text-sm text-brand-charcoal dark:text-white line-clamp-2 leading-snug group-hover:text-brand-orange transition-colors">
                      {product.name}
                    </p>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {sale.onSale && (
                      <span className="line-through text-[11px] text-gray-400">AED {formatAed(sale.compareAt)}</span>
                    )}
                    <span className="text-sm sm:text-base font-black text-brand-orange dark:text-amber-400">
                      AED {formatAed(sale.price)}
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OffersRail;
