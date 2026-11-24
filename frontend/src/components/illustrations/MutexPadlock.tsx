import React from 'react';

export const MutexPadlock: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 160 100" className={`w-full h-full max-h-[90px] ${className}`}>
      {/* Ground Shadow */}
      <ellipse cx="80" cy="74" rx="42" ry="14" fill="rgba(24, 24, 27, 0.08)" />

      {/* Background isometric locked block */}
      <polygon points="100,38 124,51 100,64 76,51" fill="#EFEAE2" stroke="#18181B" strokeWidth="1.2" />
      <polygon points="76,51 100,64 100,74 76,61" fill="#DDD6CB" stroke="#18181B" strokeWidth="1.2" />
      <polygon points="100,64 124,51 124,61 100,74" fill="#C8C0B4" stroke="#18181B" strokeWidth="1.2" />

      {/* Heavy Brass Isometric Padlock Body */}
      {/* Top Face */}
      <polygon
        points="70,36 94,48 78,56 54,44"
        fill="#FDE68A"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Front Left Face */}
      <polygon
        points="54,44 78,56 78,82 54,70"
        fill="#FCD34D"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Front Right Face */}
      <polygon
        points="78,56 94,48 94,74 78,82"
        fill="#F59E0B"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Hardened Steel Shackle */}
      <path
        d="M 62,38 L 62,24 C 62,12 84,12 84,24 L 84,43"
        fill="none"
        stroke="#4B5563"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M 62,38 L 62,24 C 62,12 84,12 84,24 L 84,43"
        fill="none"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Keyhole Detail */}
      <circle cx="66" cy="63" r="2.5" fill="#18181B" />
      <polygon points="65,63 67,63 68,70 64,70" fill="#18181B" />
    </svg>
  );
};
