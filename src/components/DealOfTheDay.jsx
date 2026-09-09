import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, ArrowRight } from 'lucide-react';

const DealOfTheDay = ({ onShop }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 45, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 45, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const cells = [timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((n) => String(n).padStart(2, '0'));

  return (
    <section className="container mx-auto px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        className="relative overflow-hidden rounded-[1.8rem] bg-brand-forestDeep text-white p-6 sm:p-10 grid md:grid-cols-[1.2fr_0.8fr] gap-6 items-center border border-brand-gold/25"
      >
        <div className="absolute inset-0 bg-premium-pattern opacity-10" aria-hidden />
        <div className="absolute -top-20 -end-20 w-80 h-80 bg-brand-gold/20 blur-3xl rounded-full" aria-hidden />
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-brand-goldSoft bg-white/10 border border-white/15 rounded-full px-3.5 py-1.5 mb-4">
            <Timer className="w-3.5 h-3.5 animate-pulse" /> Deal of the day
          </p>
          <h3 className="font-display text-3xl sm:text-4xl font-semibold leading-tight mb-2">
            Fresh Paneer 500g at <span className="text-brand-goldSoft">AED 15</span>
            <span className="line-through text-white/40 text-xl ms-2">21</span>
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-md">Same price as in-store — plus free Abu Dhabi delivery when you order on WhatsApp today.</p>
          <button onClick={onShop} className="inline-flex items-center gap-2 bg-brand-gold text-brand-forestDeep font-extrabold px-6 py-3.5 rounded-2xl hover:brightness-105 transition shadow-gold">
            Claim the deal <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="relative z-10 flex md:justify-end">
          <div className="flex gap-2.5">
            {cells.map((c, i) => (
              <div key={i} className="w-[4.5rem] text-center bg-white/[0.07] border border-white/15 rounded-2xl py-3.5">
                <div className="font-display text-3xl font-semibold tabular-nums text-brand-goldSoft">{c}</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-1">{['hrs', 'min', 'sec'][i]}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default DealOfTheDay;
