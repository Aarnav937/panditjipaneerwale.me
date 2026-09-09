import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SectionHeading from './SectionHeading';

const REVIEWS = [
  { name: 'Fatima A.', area: 'Khalifa City', text: 'Paneer is always soft and fresh — tastes like home. Delivery to our door in Abu Dhabi is so quick on WhatsApp.', stars: 5 },
  { name: 'Rohit S.', area: 'Electra Street', text: 'Best desi grocery stop for Everest spices and Amul. Honest prices, and the 500g paneer offer is genuine value.', stars: 5 },
  { name: 'Mariam K.', area: 'Mussafah', text: 'Ordered malai paneer and khoa for sweets — rich and fresh. The shop packs everything neatly. Highly recommended.', stars: 4 },
];

const Testimonials = () => (
  <section className="container mx-auto px-4 max-w-7xl py-14 md:py-20">
    <SectionHeading
      eyebrow="Community love"
      title={<>Abu Dhabi shops with us weekly.</>}
      sub="Real neighbours, real kitchens — fresh paneer and desi staples without the mall run."
    />
    <div className="grid md:grid-cols-3 gap-4">
      {REVIEWS.map((r, i) => (
        <motion.figure
          key={r.name}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: i * 0.08 }}
          className="card-premium p-6 flex flex-col gap-4 relative overflow-hidden hover:shadow-soft-hover transition-shadow"
        >
          <Quote className="absolute -top-1 end-4 w-16 h-16 text-brand-moss dark:text-white/5" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className={`w-4 h-4 ${s < r.stars ? 'text-brand-gold fill-brand-gold' : 'text-brand-border'}`} />
            ))}
          </div>
          <blockquote className="text-[15px] leading-relaxed text-brand-ink/80 dark:text-white/75 flex-1">
            “{r.text}”
          </blockquote>
          <figcaption className="flex items-center gap-3 pt-4 border-t border-brand-border/70 dark:border-white/10">
            <span className="w-10 h-10 rounded-full bg-brand-forest text-brand-goldSoft font-display font-bold flex items-center justify-center">
              {r.name[0]}
            </span>
            <span>
              <span className="block text-sm font-extrabold text-brand-forest dark:text-white">{r.name}</span>
              <span className="block text-xs text-brand-sage">{r.area}, Abu Dhabi</span>
            </span>
          </figcaption>
        </motion.figure>
      ))}
    </div>
  </section>
);

export default Testimonials;
