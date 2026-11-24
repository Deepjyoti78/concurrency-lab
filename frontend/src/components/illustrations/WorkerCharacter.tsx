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
  className = ''
}) => {
  const isFacingRight = facing === 'right';

  return (
    <g className={`worker-character ${className}`} transform={`translate(${x}, ${y})`}>
      {/* 1. Floating Identity Pill Header (e.g. ● Thread A) */}
      <g transform="translate(0, -90)">
        <rect
          x="-38"
          y="-11"
          width="76"
          height="22"
          rx="11"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1.25"
        />
        <circle cx="-25" cy="0" r="3.5" fill={pillColor} />
        <text
          x="-15"
          y="3.5"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#18181B"
        >
          {name}
        </text>
      </g>

      {/* 2. Character Body & Chair */}
      {isFacingRight ? (
        // FACING RIGHT-FORWARD (Worker A on left side)
        <g id="worker-a-body">
          {/* Chair backrest */}
          <rect
            x="-42"
            y="-38"
            width="14"
            height="28"
            rx="5"
            fill="#52525B"
            stroke="#18181B"
            strokeWidth="1.5"
            transform="rotate(-8, -42, -38)"
          />

          {/* Torso / Hoodie */}
          <path
            d="M -34 -20 C -34 -45 -14 -48 -4 -30 C 2 -18 2 2 -4 8 C -14 12 -34 6 -34 -20 Z"
            fill={hoodieColor}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Hoodie crease / detail */}
          <path
            d="M -18 -32 Q -12 -18 -16 2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.25"
          />

          {/* Head & Neck */}
          <ellipse
            cx="-12"
            cy="-48"
            rx="8.5"
            ry="10.5"
            fill="#FCD34D"
            stroke="#18181B"
            strokeWidth="1.5"
          />

          {/* Hair (side profile) */}
          <path
            d="M -21 -52 C -20 -62 -5 -62 -2 -53 C -1 -48 -4 -44 -6 -43 C -14 -42 -22 -44 -21 -52 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.5"
          />

          {/* Arms reaching to keyboard */}
          <path
            d="M -12 -16 Q 0 -12 8 -8 Q 12 -4 14 0"
            fill="none"
            stroke={hoodieColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M -12 -16 Q 0 -12 8 -8 Q 12 -4 14 0"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Hand on laptop */}
          <circle cx="14" cy="0" r="3" fill="#FCD34D" stroke="#18181B" strokeWidth="1" />

          {/* Laptop Base (Isometric keyboard) */}
          <polygon
            points="6,2 26,-8 40,-1 20,9"
            fill="#71717A"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Laptop Screen (angled isometric display facing user) */}
          <polygon
            points="26,-8 40,-1 40,-26 26,-33"
            fill="#18181B"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Screen Display Inner Glow */}
          <polygon
            points="28,-10 38,-5 38,-24 28,-29"
            fill="#27272A"
          />

          {/* Screen Code Lines */}
          <line x1="30" y1="-24" x2="36" y2="-21" stroke="#A1A1AA" strokeWidth="1" />
          <line x1="30" y1="-19" x2="37" y2="-15.5" stroke={isExecuting ? '#34D399' : '#A1A1AA'} strokeWidth="1" />
          <line x1="30" y1="-14" x2="35" y2="-11.5" stroke="#A1A1AA" strokeWidth="1" />

          {/* Screen text indicator */}
          <text
            x="33"
            y="-16"
            fill="#FFFFFF"
            fontSize="6"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            transform="skewY(20)"
          >
            {screenText.slice(0, 4)}
          </text>
        </g>
      ) : (
        // FACING LEFT-FORWARD (Worker B on right side)
        <g id="worker-b-body">
          {/* Chair backrest */}
          <rect
            x="28"
            y="-38"
            width="14"
            height="28"
            rx="5"
            fill="#52525B"
            stroke="#18181B"
            strokeWidth="1.5"
            transform="rotate(8, 28, -38)"
          />

          {/* Torso / Hoodie */}
          <path
            d="M 34 -20 C 34 -45 14 -48 4 -30 C -2 -18 -2 2 4 8 C 14 12 34 6 34 -20 Z"
            fill={hoodieColor}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Hoodie crease / detail */}
          <path
            d="M 18 -32 Q 12 -18 16 2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.25"
          />

          {/* Head & Neck */}
          <ellipse
            cx="12"
            cy="-48"
            rx="8.5"
            ry="10.5"
            fill="#FCD34D"
            stroke="#18181B"
            strokeWidth="1.5"
          />

          {/* Hair (bun profile) */}
          <path
            d="M 21 -52 C 20 -62 5 -62 2 -53 C 1 -48 4 -44 6 -43 C 14 -42 22 -44 21 -52 Z"
            fill="#18181B"
            stroke="#18181B"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="-56" r="4.5" fill="#18181B" stroke="#18181B" strokeWidth="1" />

          {/* Arms reaching to keyboard */}
          <path
            d="M 12 -16 Q 0 -12 -8 -8 Q -12 -4 -14 0"
            fill="none"
            stroke={hoodieColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 12 -16 Q 0 -12 -8 -8 Q -12 -4 -14 0"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          {/* Hand on laptop */}
          <circle cx="-14" cy="0" r="3" fill="#FCD34D" stroke="#18181B" strokeWidth="1" />

          {/* Laptop Base (Isometric keyboard) */}
          <polygon
            points="-6,2 -26,-8 -40,-1 -20,9"
            fill="#71717A"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Laptop Screen (angled isometric display facing user) */}
          <polygon
            points="-26,-8 -40,-1 -40,-26 -26,-33"
            fill="#18181B"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />

          {/* Screen Display Inner Glow */}
          <polygon
            points="-28,-10 -38,-5 -38,-24 -28,-29"
            fill="#27272A"
          />

          {/* Screen Code Lines */}
          <line x1="-30" y1="-24" x2="-36" y2="-21" stroke="#A1A1AA" strokeWidth="1" />
          <line x1="-30" y1="-19" x2="-37" y2="-15.5" stroke={isExecuting ? '#34D399' : '#A1A1AA'} strokeWidth="1" />
          <line x1="-30" y1="-14" x2="-35" y2="-11.5" stroke="#A1A1AA" strokeWidth="1" />

          {/* Screen text indicator */}
          <text
            x="-33"
            y="-16"
            fill="#FFFFFF"
            fontSize="6"
            fontFamily="JetBrains Mono, monospace"
            fontWeight="bold"
            transform="skewY(-20)"
          >
            {screenText.slice(0, 4)}
          </text>
        </g>
      )}

      {/* 3. State Status Aura (Pulsing green for RUNNING, amber for hazard, red for BLOCKED) */}
      {state === 'RUNNING' && (
        <circle
          cx="0"
          cy="-18"
          r="36"
          fill="none"
          stroke="#10B981"
          strokeWidth="1.5"
          strokeDasharray="4,4"
          opacity="0.6"
          className="animate-spin"
        />
      )}
      {state === 'BLOCKED' && (
        <circle
          cx="0"
          cy="-18"
          r="36"
          fill="none"
          stroke="#EF4444"
          strokeWidth="1.75"
          opacity="0.8"
        />
      )}
    </g>
  );
};
