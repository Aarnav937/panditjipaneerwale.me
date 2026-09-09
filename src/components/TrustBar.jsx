import React from 'react';
import { motion } from 'framer-motion';
import { Truck, BadgeCheck, Leaf, Headset } from 'lucide-react';

const ITEMS = [
  { icon: BadgeCheck, title: 'Pure & honest', sub: 'No-nonsense pricing' },
  { icon: Truck, title: 'Free delivery', sub: 'Across Abu Dhabi' },
  { icon: Leaf, title: 'Fresh daily', sub: 'Dairy you trust' },
  { icon: Headset, title: 'WhatsApp care', sub: '+971 52 467 6306' },
];

const TrustBar = () => (
  <section className="container mx-auto px-4 max-w-7xl">
    <div className="card-premium grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-brand-border/70 dark:divide-white/10 overflow-hidden rtl:divide-x-reverse">
      {ITEMS.map((it, i) => (
        <motion.div
          key={it.title}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center gap-3 p-4 sm:p-5"
        >
          <span className="w-11 h-11 rounded-2xl bg-brand-forest text-brand-goldSoft flex items-center justify-center shrink-0">
            <it.icon className="w-5 h-5" />
          </span>
          <span>
            <span className="block text-sm font-extrabold text-brand-forest dark:text-white leading-tight">{it.title}</span>
            <span className="block text-xs text-brand-sage font-medium">{it.sub}</span>
          </span>
        </motion.div>
      ))}
    </div>
  </section>
);

export default TrustBar;
