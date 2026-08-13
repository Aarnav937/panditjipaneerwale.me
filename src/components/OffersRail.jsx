import React from 'react';
import { motion } from 'framer-motion';
import { products } from '../data/products';
import { formatAed, getSaleInfo } from '../lib/pricing';

const FEATURED_IDS = [3, 51, 6, 5, 7, 10, 25, 91];

const OffersRail = ({ onOpenProduct }) => {
  const byId = new Map(products.map((p) => [p.id, p]));
  const cards = FEATURED_IDS.map((id) => byId.get(id)).filter(Boolean);

  if (cards.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-b border-brand-gold/20 dark:border-gray-800">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/images/offers-banner.webp')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#FFE8C8]/80 via-[#FFF6F0]/70 to-[#FFD7A8]/75 dark:from-[#2A1208]/80 dark:via-[#1A0E08]/75 dark:to-[#3A1808]/80" />

      <div className="container mx-auto px-4 py-10 md:py-12 relative z-10">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-saffron mb-1">Today</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-brand-charcoal dark:text-white mb-1">
          Exclusive <span className="text-brand-saffron">Offers</span>
        </h2>
        <p className="text-sm text-brand-muted dark:text-orange-100/70 mb-6">
          Fresh Paneer 500g is on a real online sale. Other picks are shop favourites at their usual price.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((product) => {
            const sale = getSaleInfo(product);
            return (
              <motion.button
                key={product.id}
                type="button"
                onClick={() => onOpenProduct?.(product)}
                whileTap={{ scale: 0.98 }}
                className="text-left bg-white/95 dark:bg-[#2A1810]/95 rounded-2xl border border-brand-gold/40 dark:border-brand-orange/25 p-3 flex gap-3 shadow-gold-glow"
              >
                <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden image-plate">
                  <img src={product.image} alt="" className="product-cutout w-full h-full object-contain p-1.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full mb-1 ${
                    sale.onSale ? 'bg-brand-saffron text-white' : 'bg-brand-orange/15 text-brand-saffron'
                  }`}>
                    {sale.onSale ? `${sale.percent}% off` : 'Popular'}
                  </span>
                  <p className="font-bold text-sm text-brand-charcoal dark:text-white line-clamp-2">{product.name}</p>
                  <p className="mt-1 text-sm">
                    {sale.onSale && (
                      <span className="line-through text-brand-muted mr-2">AED {formatAed(sale.compareAt)}</span>
                    )}
                    <span className="font-extrabold text-brand-saffron">AED {formatAed(sale.price)}</span>
                  </p>
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
