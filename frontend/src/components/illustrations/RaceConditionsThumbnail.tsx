import React from 'react';

export const RaceConditionsThumbnail: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 160 100" className={`w-full h-full max-h-[90px] ${className}`}>
      {/* Background shadow */}
      <ellipse cx="80" cy="65" rx="55" ry="18" fill="rgba(24, 24, 27, 0.05)" />

      {/* Dotted lines connecting to center */}
      <line x1="36" y1="52" x2="72" y2="44" stroke="#D4CCC0" strokeWidth="1" strokeDasharray="2,2" />
      <line x1="124" y1="52" x2="88" y2="44" stroke="#D4CCC0" strokeWidth="1" strokeDasharray="2,2" />

      {/* Worker A mini pedestal & character */}
      <polygon points="34,42 50,51 34,60 18,51" fill="#FAF6EE" stroke="#18181B" strokeWidth="1.2" />
      <circle cx="34" cy="38" r="6" fill="#DDD6FE" stroke="#18181B" strokeWidth="1.2" />
      <rect x="30" y="44" width="8" height="6" rx="1" fill="#7C3AED" />

      {/* Center Shared Memory Cube */}
      <polygon points="80,24 96,33 80,42 64,33" fill="#FCE7F3" stroke="#18181B" strokeWidth="1.2" />
      <polygon points="64,33 80,42 80,56 64,47" fill="#FBCFE8" stroke="#18181B" strokeWidth="1.2" />
      <polygon points="80,42 96,33 96,47 80,56" fill="#F472B6" stroke="#18181B" strokeWidth="1.2" />
      <text x="72" y="52" fontSize="5" fontFamily="monospace" fontWeight="bold" fill="#18181B">x=0</text>

      {/* Worker B mini pedestal & character */}
      <polygon points="126,42 142,51 126,60 110,51" fill="#FAF6EE" stroke="#18181B" strokeWidth="1.2" />
      <circle cx="126" cy="38" r="6" fill="#A7F3D0" stroke="#18181B" strokeWidth="1.2" />
      <rect x="122" y="44" width="8" height="6" rx="1" fill="#059669" />

      {/* Floating data packet */}
      <polygon points="56,44 60,46 56,48 52,46" fill="#A78BFA" stroke="#18181B" strokeWidth="0.8" />
      <polygon points="104,44 108,46 104,48 100,46" fill="#34D399" stroke="#18181B" strokeWidth="0.8" />
    </svg>
  );
};
