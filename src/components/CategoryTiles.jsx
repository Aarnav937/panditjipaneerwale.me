import React from 'react';
import { motion } from 'framer-motion';
import { Milk, Sparkles, ShoppingBasket, CupSoda, Droplets, Leaf, Croissant, Coffee } from 'lucide-react';
import { products, categories } from '../data/products';

const ICONS = [Milk, Sparkles, ShoppingBasket, CupSoda, Droplets, Leaf, Croissant, Coffee];

const CategoryTiles = ({ active, onSelect }) => {
  const counts = React.useMemo(() => {
    const m = {};
    products.forEach((p) => { m[p.category] = (m[p.category] || 0) + 1; });
    return m;
  }, []);

  const tiles = categories.filter((c) => c !== 'All').slice(0, 8);

  return (
    <section className="container mx-auto px-4 max-w-7xl -mt-2">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3">
        {tiles.map((cat, i) => {
          const Icon = ICONS[i % ICONS.length];
          const isActive = active === cat;
          return (
            <motion.button
              key={cat}
              type="button"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ delay: Math.min(i * 0.04, 0.25) }}
              whileTap={{ scale: 0.94 }}
              onClick={(e) => onSelect(cat, e)}
              className={`group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border transition-all text-center ${
                isActive
                  ? 'bg-brand-forest text-white border-brand-forest shadow-soft-hover'
                  : 'card-premium hover:border-brand-forest/40 hover:-translate-y-0.5'
              }`}
            >
              <span className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-colors ${
                isActive ? 'bg-white/15 text-brand-goldSoft' : 'bg-brand-moss dark:bg-white/10 text-brand-forest dark:text-brand-goldSoft group-hover:bg-brand-forest group-hover:text-white'
              }`}>
                <Icon className="w-5 h-5" />
              </span>
              <span className={`text-[10px] sm:text-xs font-bold leading-tight line-clamp-2 ${isActive ? 'text-white' : 'text-brand-ink dark:text-white/85'}`}>
                {cat}
              </span>
              <span className={`text-[10px] font-semibold tabular-nums ${isActive ? 'text-white/60' : 'text-brand-sage'}`}>
                {counts[cat] || 0}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryTiles;
