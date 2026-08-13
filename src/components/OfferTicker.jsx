import React from 'react';

const OfferTicker = () => (
  <div className="offer-ticker bg-brand-saffron text-white text-[11px] sm:text-xs font-bold tracking-wide">
    <div className="offer-ticker-track">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="inline-flex items-center gap-3 px-4">
          <span>Big Bumper Offer</span>
          <span aria-hidden>·</span>
          <span>Fresh Paneer 500g</span>
          <span aria-hidden>·</span>
          <span className="line-through opacity-80">AED 21</span>
          <span>Now AED 15</span>
          <span aria-hidden>·</span>
          <span>In-store AED 15</span>
          <span aria-hidden>·</span>
          <span>Free delivery Abu Dhabi</span>
        </span>
      ))}
    </div>
  </div>
);

export default OfferTicker;
