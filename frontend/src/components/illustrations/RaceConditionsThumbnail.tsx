import React from 'react';

export const RaceConditionsThumbnail: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 240 140" className={`w-full h-full ${className}`} preserveAspectRatio="xMidYMid meet">
      {/* Soft Ground Shadow */}
      <ellipse cx="120" cy="98" rx="85" ry="24" fill="rgba(24, 24, 27, 0.06)" />

      {/* Dashed connector lines between workers and memory vault */}
      <line x1="60" y1="78" x2="105" y2="60" stroke="#DED7CB" strokeWidth="1.25" strokeDasharray="3,3" />
      <line x1="135" y1="60" x2="180" y2="78" stroke="#DED7CB" strokeWidth="1.25" strokeDasharray="3,3" />

      {/* Floating data packets along connectors */}
      <polygon points="80,68 85,71 80,74 75,71" fill="#9B87F5" stroke="#18181B" strokeWidth="0.8" />
      <polygon points="160,68 165,71 160,74 155,71" fill="#6EE7B7" stroke="#18181B" strokeWidth="0.8" />

      {/* Left Worker A Workstation */}
      {/* Plinth */}
      <polygon points="35,74 65,58 95,74 65,90" fill="#FAF6EE" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
      <polygon points="35,74 65,90 65,98 35,82" fill="#E8E2D8" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
      <polygon points="65,90 95,74 95,82 65,98" fill="#DDD6CB" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Worker A Torso / Head */}
      <ellipse cx="58" cy="62" rx="7" ry="9" fill="#FDE0B6" stroke="#18181B" strokeWidth="1.1" />
      <path d="M 50 60 C 50 48 64 48 66 58 Z" fill="#27272A" />
      <path d="M 48 76 C 46 64 62 62 70 70 Z" fill="#8B5CF6" stroke="#18181B" strokeWidth="1.2" />
      {/* Laptop */}
      <polygon points="68,70 78,64 86,68 76,74" fill="#94A3B8" stroke="#18181B" strokeWidth="1" />
      <polygon points="78,64 86,68 86,54 78,50" fill="#1E293B" stroke="#18181B" strokeWidth="1" />

      {/* Center Shared Memory Vault Cube */}
      {/* Top Face */}
      <polygon points="120,32 144,46 120,60 96,46" fill="#FBE9E4" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />
      {/* Left Face */}
      <polygon points="96,46 120,60 120,92 96,78" fill="#F5DDD6" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />
      {/* Right Face */}
      <polygon points="120,60 144,46 144,78 120,92" fill="#E8C5BC" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />
      {/* Inset Cylinder on Top */}
      <ellipse cx="120" cy="46" rx="10" ry="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
      <circle cx="120" cy="45" r="2.5" fill="#9E381E" />
      {/* Value Badge: x=0 */}
      <rect x="108" y="66" width="24" height="13" rx="3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
      <text x="120" y="75" textAnchor="middle" fontFamily="monospace" fontSize="7.5" fontWeight="bold" fill="#18181B">x=0</text>

      {/* Right Worker B Workstation */}
      {/* Plinth */}
      <polygon points="145,74 175,58 205,74 175,90" fill="#FAF6EE" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
      <polygon points="145,74 175,90 175,98 145,82" fill="#E8E2D8" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
      <polygon points="175,90 205,74 205,82 175,98" fill="#DDD6CB" stroke="#18181B" strokeWidth="1.2" strokeLinejoin="round" />
      {/* Worker B Torso / Head */}
      <ellipse cx="182" cy="62" rx="7" ry="9" fill="#FDE0B6" stroke="#18181B" strokeWidth="1.1" />
      <path d="M 174 60 C 174 48 188 48 190 58 Z" fill="#27272A" />
      <circle cx="186" cy="51" r="3" fill="#27272A" />
      <path d="M 170 70 C 178 62 194 64 192 76 Z" fill="#10B981" stroke="#18181B" strokeWidth="1.2" />
      {/* Laptop */}
      <polygon points="154,68 162,64 172,70 164,74" fill="#94A3B8" stroke="#18181B" strokeWidth="1" />
      <polygon points="154,68 162,64 162,50 154,54" fill="#1E293B" stroke="#18181B" strokeWidth="1" />
    </svg>
  );
};
