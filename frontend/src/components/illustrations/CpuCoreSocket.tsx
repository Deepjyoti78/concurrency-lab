import React from 'react';

export const CpuCoreSocket: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg viewBox="0 0 160 100" className={`w-full h-full max-h-[90px] ${className}`}>
      {/* Shadow */}
      <ellipse cx="80" cy="62" rx="46" ry="18" fill="rgba(24, 24, 27, 0.08)" />

      {/* Socket Pins Bed (lower level) */}
      <polygon
        points="80,18 126,42 80,66 34,42"
        fill="#DDD6CB"
        stroke="#18181B"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <polygon
        points="34,42 80,66 80,72 34,48"
        fill="#C4BCB0"
        stroke="#18181B"
        strokeWidth="1.25"
      />
      <polygon
        points="80,66 126,42 126,48 80,72"
        fill="#B5ACA0"
        stroke="#18181B"
        strokeWidth="1.25"
      />

      {/* Gold Edge Connector Pins */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`pin-l-${i}`}
          x1={44 + i * 8}
          y1={47 + i * 4}
          x2={44 + i * 8}
          y2={53 + i * 4}
          stroke="#F59E0B"
          strokeWidth="1.5"
        />
      ))}

      {/* Silicon Die / CPU Package (raised isometric block) */}
      <polygon
        points="80,24 114,42 80,60 46,42"
        fill="#FAF6EE"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <polygon
        points="46,42 80,60 80,65 46,47"
        fill="#E8E2D8"
        stroke="#18181B"
        strokeWidth="1.5"
      />
      <polygon
        points="80,60 114,42 114,47 80,65"
        fill="#D6CFC4"
        stroke="#18181B"
        strokeWidth="1.5"
      />

      {/* Heatspreader Center Core */}
      <polygon
        points="80,32 100,42 80,52 60,42"
        fill="#27272A"
        stroke="#18181B"
        strokeWidth="1.2"
      />
      <text
        x="80"
        y="44"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="7"
        fontWeight="bold"
        fill="#FFFFFF"
      >
        CPU
      </text>
    </svg>
  );
};
