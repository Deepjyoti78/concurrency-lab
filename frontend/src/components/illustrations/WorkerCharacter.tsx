import React from 'react';

interface WorkerCharacterProps {
  x: number;
  y: number;
  name: string;
  pillColor: string; // e.g. '#7C3AED' for Thread A, '#059669' for Thread B
  hoodieColor: string;
  facing: 'left' | 'right';
  screenText?: string;
  isExecuting?: boolean;
  state?: 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';
  imageSrc?: string;
  scale?: number;
  className?: string;
}

export const WorkerCharacter: React.FC<WorkerCharacterProps> = ({
  x,
  y,
  name,
  pillColor,
  hoodieColor,
  facing,
  screenText = 'r = x',
  isExecuting = false,
  state = 'READY',
  imageSrc,
  scale = 1,
  className = ''
}) => {
  const isFacingRight = facing === 'right';

  return (
    <g
      className={`worker-character ${className}`}
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      {/* 1. Floating Identity Pill Header (e.g. ● Thread A) */}
      <g transform="translate(0, -104)">
        <rect
          x="-42"
          y="-13"
          width="84"
          height="26"
          rx="13"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1.25"
          filter="drop-shadow(0 1px 2px rgba(24,24,27,0.06))"
        />
        <circle cx="-27" cy="0" r="4" fill={pillColor} />
        <text
          x="-17"
          y="3.5"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="11"
          fontWeight="700"
          fill="#18181B"
          letterSpacing="-0.01em"
        >
          {name}
        </text>
      </g>

      {/* 2. Character Artwork: External Transparent Asset OR Hand-Crafted Editorial Vector */}
      {imageSrc ? (
        <g transform="translate(-55, -90)">
          <image
            href={imageSrc}
            x="0"
            y="0"
            width="110"
            height="110"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      ) : isFacingRight ? (
        // ==================== WORKER A: FACING RIGHT-FORWARD ====================
        <g id="worker-a-artwork">
          {/* Chair / Ergonomic Stool */}
          <ellipse cx="-28" cy="12" rx="18" ry="6" fill="#3F3F46" stroke="#18181B" strokeWidth="1.25" />
          <path d="M -28 12 L -28 -10" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M -46 -8 C -48 -28 -44 -42 -38 -44 C -32 -46 -30 -30 -30 -12 Z"
            fill="#52525B"
            stroke="#18181B"
            strokeWidth="1.25"
          />

          {/* Lower Torso / Legs Seated */}
          <path
            d="M -34 -6 C -34 6 -24 16 -12 16 C -4 16 0 10 2 2 L -8 -6 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Main Torso & Hoodie Body */}
          <path
            d="M -38 -18 C -40 -46 -22 -52 -4 -38 C 4 -26 4 -6 -2 4 C -12 8 -34 4 -38 -18 Z"
            fill={hoodieColor}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Hoodie Shadow & Fold Detail */}
          <path
            d="M -22 -40 Q -14 -22 -18 2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M -34 -14 C -30 -6 -20 -4 -10 -2"
            fill="none"
            stroke="rgba(24, 24, 27, 0.15)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Head & Neck */}
          <ellipse
            cx="-14"
            cy="-54"
            rx="10"
            ry="12"
            fill="#FDE0B6"
            stroke="#18181B"
            strokeWidth="1.4"
          />

          {/* Ear */}
          <ellipse cx="-20" cy="-52" rx="2.5" ry="3.5" fill="#FDE0B6" stroke="#18181B" strokeWidth="1" />

          {/* Styled Hair Profile */}
          <path
            d="M -24 -58 C -24 -70 -8 -72 -2 -62 C 2 -54 -2 -48 -4 -46 C -12 -46 -24 -48 -24 -58 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Hair bangs / fringe */}
          <path
            d="M -8 -66 C -2 -64 2 -60 2 -55 C -2 -54 -4 -56 -8 -58 Z"
            fill="#18181B"
          />

          {/* Eye & Brow Hint */}
          <circle cx="-6" cy="-54" r="1.2" fill="#18181B" />
          <path d="M -8 -58 Q -5 -59 -3 -57" stroke="#18181B" strokeWidth="1" strokeLinecap="round" fill="none" />

          {/* Left / Upper Arm reaching to laptop */}
          <path
            d="M -16 -24 Q -2 -18 8 -12 Q 16 -6 20 -2"
            fill="none"
            stroke={hoodieColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M -16 -24 Q -2 -18 8 -12 Q 16 -6 20 -2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Hand on Keyboard */}
          <ellipse cx="20" cy="-2" rx="3.5" ry="2.5" fill="#FDE0B6" stroke="#18181B" strokeWidth="1" />

          {/* Modern Isometric Laptop Base */}
          <polygon
            points="10,0 34,-12 50,-4 26,8"
            fill="#94A3B8"
            stroke="#18181B"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Keyboard keys surface */}
          <polygon
            points="14,-1 32,-10 44,-4 26,5"
            fill="#334155"
          />

          {/* Modern Isometric Laptop Display (angled towards user) */}
          <polygon
            points="34,-12 50,-4 50,-36 34,-44"
            fill="#1E293B"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Screen Inner Bezel */}
          <polygon
            points="36,-14 48,-8 48,-34 36,-40"
            fill={isExecuting ? '#0F172A' : '#18181B'}
          />

          {/* Code Lines on Screen */}
          <line x1="39" y1="-32" x2="45" y2="-29" stroke={isExecuting ? '#34D399' : '#64748B'} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="39" y1="-26" x2="46" y2="-22.5" stroke={isExecuting ? '#A7F3D0' : '#475569'} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="39" y1="-20" x2="44" y2="-17.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />

          {/* Small Screen Prompt Badge */}
          <text
            x="41"
            y="-22"
            fill="#FFFFFF"
            fontSize="5.5"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            transform="skewY(22)"
          >
            {screenText.slice(0, 4)}
          </text>
        </g>
      ) : (
        // ==================== WORKER B: FACING LEFT-FORWARD ====================
        <g id="worker-b-artwork">
          {/* Chair / Ergonomic Stool */}
          <ellipse cx="28" cy="12" rx="18" ry="6" fill="#3F3F46" stroke="#18181B" strokeWidth="1.25" />
          <path d="M 28 12 L 28 -10" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M 46 -8 C 48 -28 44 -42 38 -44 C 32 -46 30 -30 30 -12 Z"
            fill="#52525B"
            stroke="#18181B"
            strokeWidth="1.25"
          />

          {/* Lower Torso / Legs Seated */}
          <path
            d="M 34 -6 C 34 6 24 16 12 16 C 4 16 0 10 -2 2 L 8 -6 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Main Torso & Hoodie Body */}
          <path
            d="M 38 -18 C 40 -46 22 -52 4 -38 C -4 -26 -4 -6 2 4 C 12 8 34 4 38 -18 Z"
            fill={hoodieColor}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Hoodie Shadow & Fold Detail */}
          <path
            d="M 22 -40 Q 14 -22 18 2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M 34 -14 C 30 -6 20 -4 10 -2"
            fill="none"
            stroke="rgba(24, 24, 27, 0.15)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Head & Neck */}
          <ellipse
            cx="14"
            cy="-54"
            rx="10"
            ry="12"
            fill="#FDE0B6"
            stroke="#18181B"
            strokeWidth="1.4"
          />

          {/* Ear */}
          <ellipse cx="20" cy="-52" rx="2.5" ry="3.5" fill="#FDE0B6" stroke="#18181B" strokeWidth="1" />

          {/* Hair with Top-Bun Profile */}
          <path
            d="M 24 -58 C 24 -70 8 -72 2 -62 C -2 -54 2 -48 4 -46 C 12 -46 24 -48 24 -58 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Top knot / bun */}
          <circle cx="18" cy="-68" r="5.5" fill="#18181B" stroke="#18181B" strokeWidth="1.2" />
          <line x1="12" y1="-72" x2="24" y2="-64" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />

          {/* Eye & Brow Hint */}
          <circle cx="6" cy="-54" r="1.2" fill="#18181B" />
          <path d="M 8 -58 Q 5 -59 3 -57" stroke="#18181B" strokeWidth="1" strokeLinecap="round" fill="none" />

          {/* Arm reaching to keyboard */}
          <path
            d="M 16 -24 Q 2 -18 -8 -12 Q -16 -6 -20 -2"
            fill="none"
            stroke={hoodieColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 16 -24 Q 2 -18 -8 -12 Q -16 -6 -20 -2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />

          {/* Hand on Keyboard */}
          <ellipse cx="-20" cy="-2" rx="3.5" ry="2.5" fill="#FDE0B6" stroke="#18181B" strokeWidth="1" />

          {/* Modern Isometric Laptop Base */}
          <polygon
            points="-10,0 -34,-12 -50,-4 -26,8"
            fill="#94A3B8"
            stroke="#18181B"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Keyboard keys surface */}
          <polygon
            points="-14,-1 -32,-10 -44,-4 -26,5"
            fill="#334155"
          />

          {/* Modern Isometric Laptop Display (angled towards user) */}
          <polygon
            points="-34,-12 -50,-4 -50,-36 -34,-44"
            fill="#1E293B"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Screen Inner Bezel */}
          <polygon
            points="-36,-14 -48,-8 -48,-34 -36,-40"
            fill={isExecuting ? '#0F172A' : '#18181B'}
          />

          {/* Code Lines on Screen */}
          <line x1="-39" y1="-32" x2="-45" y2="-29" stroke={isExecuting ? '#34D399' : '#64748B'} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-39" y1="-26" x2="-46" y2="-22.5" stroke={isExecuting ? '#A7F3D0' : '#475569'} strokeWidth="1.2" strokeLinecap="round" />
          <line x1="-39" y1="-20" x2="-44" y2="-17.5" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" />

          {/* Small Screen Prompt Badge */}
          <text
            x="-41"
            y="-22"
            fill="#FFFFFF"
            fontSize="5.5"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            transform="skewY(-22)"
          >
            {screenText.slice(0, 4)}
          </text>
        </g>
      )}

      {/* 3. Subtle Active Execution Indicator (Clean, non-distracting) */}
      {isExecuting && (
        <g transform="translate(0, 22)">
          <rect
            x="-26"
            y="-7"
            width="52"
            height="14"
            rx="7"
            fill="#18181B"
            stroke="#10B981"
            strokeWidth="1"
          />
          <circle cx="-16" cy="0" r="2.5" fill="#10B981" />
          <text
            x="-8"
            y="3"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="8"
            fontWeight="700"
            fill="#FFFFFF"
          >
            ACTIVE
          </text>
        </g>
      )}
      {state === 'BLOCKED' && (
        <g transform="translate(0, 22)">
          <rect
            x="-28"
            y="-7"
            width="56"
            height="14"
            rx="7"
            fill="#7F1D1D"
            stroke="#EF4444"
            strokeWidth="1"
          />
          <text
            x="0"
            y="3"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="8"
            fontWeight="700"
            fill="#FFFFFF"
          >
            WAITING
          </text>
        </g>
      )}
    </g>
  );
};
