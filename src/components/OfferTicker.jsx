import React from 'react';
import { Sparkles, Truck, Flame } from 'lucide-react';

const OfferTicker = () => (
  <div className="offer-ticker bg-gradient-to-r from-amber-600 via-brand-saffron to-brand-orange text-white text-[11px] sm:text-xs font-bold tracking-wide py-1.5 shadow-sm border-b border-white/10 select-none">
    <div className="offer-ticker-track">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="inline-flex items-center gap-3 px-6 shrink-0">
          <span className="inline-flex items-center gap-1 font-black uppercase tracking-wider text-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Daily Fresh Special
          </span>
          <span className="opacity-40 font-light">•</span>
          <span className="font-extrabold">Fresh Paneer 500g</span>
          <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-black">
            <span className="line-through opacity-75 mr-1">AED 21</span>
            <span className="text-amber-200">AED 15</span>
          </span>
          <span className="opacity-40 font-light">•</span>
          <span className="inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-amber-200" /> Free Delivery in Abu Dhabi
          </span>
          <span className="opacity-40 font-light">•</span>
          <span className="inline-flex items-center gap-1 text-white/90">
            <Sparkles className="w-3 h-3 text-amber-300" /> Fresh Paneer Prepared Daily
          </span>
        </span>
      ))}
    </div>
  </div>
);

export default OfferTicker;
