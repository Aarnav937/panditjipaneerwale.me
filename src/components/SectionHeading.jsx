import React from 'react';
import { motion } from 'framer-motion';

const SectionHeading = ({ eyebrow, title, sub, align = 'center', dark = false }) => (
  <div className={`${align === 'center' ? 'text-center mx-auto' : 'text-start'} max-w-2xl mb-8`}>
    {eyebrow && (
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="eyebrow mb-2"
      >
        {eyebrow}
      </motion.p>
    )}
    <motion.h2
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      className={`font-display text-3xl md:text-[2.6rem] font-semibold tracking-tight leading-[1.08] ${dark ? 'text-white' : 'text-brand-forest dark:text-white'}`}
    >
      {title}
    </motion.h2>
    {sub && (
      <p className={`mt-3 text-[15px] leading-relaxed ${dark ? 'text-white/60' : 'text-brand-ink/60 dark:text-white/60'}`}>
        {sub}
      </p>
    )}
    <div className={`gold-divider max-w-[12rem] mt-4 ${align === 'center' ? 'mx-auto' : ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0" />
    </div>
  </div>
);

export default SectionHeading;
