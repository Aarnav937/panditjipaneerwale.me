import React from 'react';

// Gold rule with a lotus-and-diamond centrepiece, in the manner of a palace border.
export const RoyalDivider = ({ className = '', tone = 'gold' }) => {
  const stroke = tone === 'light' ? '#F3D27A' : '#C9962B';
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 24"
      className={`block h-6 w-56 sm:w-72 ${className}`}
      fill="none"
    >
      <defs>
        {/* userSpaceOnUse: a flat line has a zero-height box, which breaks bounding-box gradients. */}
        <linearGradient id={`royal-rule-${tone}`} gradientUnits="userSpaceOnUse" x1="0" y1="12" x2="240" y2="12">
          <stop offset="0" stopColor={stroke} stopOpacity="0" />
          <stop offset="0.5" stopColor={stroke} />
          <stop offset="1" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 12h92M148 12h92" stroke={`url(#royal-rule-${tone})`} strokeWidth="1.5" />
      <path d="M30 15.5h62M148 15.5h62" stroke={`url(#royal-rule-${tone})`} strokeWidth="0.75" opacity="0.6" />
      <path d="M86 12l4-3 4 3-4 3zM146 12l4-3 4 3-4 3z" fill={stroke} />
      {/* Lotus */}
      <path
        d="M120 3c3 3.5 3 8 0 11-3-3-3-7.5 0-11zM120 14c-3.5-1.5-7-1.2-10 .8 3 2.6 7 2.6 10-.8zM120 14c3.5-1.5 7-1.2 10 .8-3 2.6-7 2.6-10-.8z"
        fill={stroke}
      />
      <path d="M110 18.5h20" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
      <circle cx="104" cy="12" r="1.3" fill={stroke} />
      <circle cx="136" cy="12" r="1.3" fill={stroke} />
    </svg>
  );
};

// Small-caps label with flourishes, shown above section headings.
export const RoyalEyebrow = ({ children, className = '', tone = 'gold' }) => (
  <span
    className={`inline-flex items-center gap-2 text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.28em] ${
      tone === 'light' ? 'text-brand-royalGoldLight' : 'text-[#A0700F] dark:text-brand-royalGoldLight'
    } ${className}`}
  >
    <span aria-hidden="true" className="text-[10px]">✦</span>
    {children}
    <span aria-hidden="true" className="text-[10px]">✦</span>
  </span>
);
