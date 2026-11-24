import React from 'react';
import { Sparkles, Truck, Flame } from 'lucide-react';

const OfferTicker = () => (
  <div className="offer-ticker relative bg-gradient-to-r from-brand-maroonDeep via-brand-maroon to-brand-maroonDeep text-amber-50 text-[11px] sm:text-xs font-bold tracking-wide py-1.5 border-b border-brand-royalGold/50 select-none">
    <div className="offer-ticker-track">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="inline-flex items-center gap-3 px-6 shrink-0">
          <span className="inline-flex items-center gap-1 font-black uppercase tracking-[0.18em] text-brand-royalGoldLight">
            <Flame className="w-3.5 h-3.5 text-brand-marigold fill-brand-kesar" /> Daily Fresh Special
          </span>
          <span className="text-brand-royalGold">✦</span>
          <span className="font-extrabold">Fresh Paneer 500g</span>
          <span className="bg-gradient-to-r from-brand-marigold to-brand-kesar text-white px-2 py-0.5 rounded-full text-[10px] font-black">
            <span className="line-through opacity-75 mr-1">AED 21</span>
            <span>AED 20</span>
          </span>
          <span className="text-brand-royalGold">✦</span>
          <span className="inline-flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-brand-royalGoldLight" /> Free Delivery in Abu Dhabi
          </span>
          <span className="text-brand-royalGold">✦</span>
          <span className="inline-flex items-center gap-1 text-amber-50/90">
            <Sparkles className="w-3 h-3 text-brand-royalGoldLight" /> Fresh Paneer Prepared Daily
          </span>
        </span>
      ))}
    </div>
  </div>
);

export default OfferTicker;
