import React from 'react';

export const MutexPadlock: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 140" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      {/* Ground Cast Shadow */}
      <ellipse cx="120" cy="104" rx="76" ry="22" fill="rgba(24, 24, 27, 0.08)" />

      {/* Protected Shared State Block (Vault Block in Background) */}
      {/* Top Face */}
      <polygon points="150,44 185,62 150,80 115,62" fill="#FAF6EE" stroke="#18181B" strokeWidth="1.25" strokeLinejoin="round" />
      {/* Left Face */}
      <polygon points="115,62 150,80 150,102 115,84" fill="#E8E2D8" stroke="#18181B" strokeWidth="1.25" strokeLinejoin="round" />
      {/* Right Face */}
      <polygon points="150,80 185,62 185,84 150,102" fill="#D6CFC4" stroke="#18181B" strokeWidth="1.25" strokeLinejoin="round" />
      {/* Shared Var Badge */}
      <text x="156" y="88" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#78716C">x=LOCK</text>

      {/* Heavy Brass Isometric Mutex Padlock in Foreground */}
      {/* Hardened Steel Shackle */}
      <path
        d="M 88,54 L 88,34 C 88,16 116,16 116,34 L 116,58"
        fill="none"
        stroke="#4B5563"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 88,54 L 88,34 C 88,16 116,16 116,34 L 116,58"
        fill="none"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Padlock Body: Top Face */}
      <polygon
        points="102,52 130,66 110,76 82,62"
        fill="#FEF3C7"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Padlock Body: Front Left Face */}
      <polygon
        points="82,62 110,76 110,106 82,92"
        fill="#FDE68A"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* Padlock Body: Front Right Face */}
      <polygon
        points="110,76 130,66 130,96 110,106"
        fill="#F59E0B"
        stroke="#18181B"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Keyhole on Front Left Face */}
      <circle cx="96" cy="85" r="3" fill="#18181B" />
      <polygon points="94.5,85 97.5,85 98.5,94 93.5,94" fill="#18181B" />

      {/* Mutex Pill Label */}
      <g transform="translate(104, 114)">
        <rect x="-24" y="-8" width="48" height="16" rx="8" fill="#18181B" />
        <text x="0" y="3.5" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="7.5" fontWeight="bold" fill="#FEF3C7">MUTEX</text>
      </g>
    </svg>
  );
};
