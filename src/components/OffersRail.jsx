import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { products as defaultProducts } from '../data/products';
import { formatAed, getSaleInfo } from '../lib/pricing';
import { getDailyFeaturedDeals } from '../lib/discounts';
import { RoyalDivider, RoyalEyebrow } from './RoyalOrnament';

const OffersRail = ({ onOpenProduct, products: propProducts, featureIds }) => {
  const sourceProducts = propProducts && propProducts.length > 0 ? propProducts : defaultProducts;
  const cards = useMemo(() => featureIds?.length
    ? featureIds.map(id => sourceProducts.find(p => p.id === id)).filter(Boolean)
    : getDailyFeaturedDeals(sourceProducts, 8), [sourceProducts, featureIds]);

  if (cards.length === 0) return null;

  return (
    <section aria-label="Daily offers" className="daily-offers relative overflow-hidden py-10 md:py-14 border-y border-white/60 bg-white/25 backdrop-blur-2xl dark:border-white/5 dark:bg-black/20">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="daily-offers-heading flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <RoyalEyebrow className="mb-2">
              <Flame className="w-3.5 h-3.5 text-brand-kesar fill-brand-marigold" />
              Handpicked Daily Specials
            </RoyalEyebrow>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-brand-ink dark:text-white tracking-tight">
              Featured <span className="text-kesar italic pr-1">Abu Dhabi Deals</span>
            </h2>
            <RoyalDivider className="mt-2 -ml-2" />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
            <span className="md:hidden">Swipe to discover today's offers</span>
            <span className="hidden md:inline">Fresh daily batches & top customer favorites in Abu Dhabi with same-day doorstep delivery.</span>
          </p>
        </div>

        <div className="daily-offers-track grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((product) => {
            const sale = getSaleInfo(product);
            return (
              <motion.button
                key={product.id}
                type="button"
                onClick={() => onOpenProduct?.(product)}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="daily-offer-card premium-frame text-left bg-white/95 dark:bg-[#1A0B0E]/95 rounded-3xl hover:border-brand-royalGold dark:hover:border-brand-royalGold/60 p-4 flex gap-3.5 shadow-premium hover:shadow-premium-hover transition-all group cursor-pointer"
              >
                <div className="daily-offer-image w-20 h-20 shrink-0 rounded-2xl overflow-hidden image-plate flex items-center justify-center p-2 relative border border-gray-100 dark:border-white/5">
                  <img src={product.image} alt={product.name} loading="lazy" decoding="async" className="product-cutout w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
                <div className="min-w-0 flex-1 flex flex-col justify-between">
                  <div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-1 ${
                      sale.onSale 
                        ? 'bg-brand-maroon text-brand-royalGoldLight border border-brand-royalGold/50'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}>
                      {sale.onSale ? `${sale.percent}% OFF` : '⭐ Popular'}
                    </span>
                    <p className="font-bold text-xs sm:text-sm text-brand-ink dark:text-white line-clamp-2 leading-snug group-hover:text-brand-kesar transition-colors">
                      {product.name}
                    </p>
                  </div>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    {sale.onSale && (
                      <span className="line-through text-[11px] text-[#8A6A58] dark:text-gray-400">AED {formatAed(sale.compareAt)}</span>
                    )}
                    <span className="text-kesar text-sm sm:text-base font-black">
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
