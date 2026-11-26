import React from 'react';

interface WorkerCharacterProps {
  x: number;
  y: number;
  name: string;
  pillColor: string; // e.g. '#7C3AED' for Thread A, '#059669' for Thread B
  hoodieColor: string;
  facing: 'left' | 'right';
  screenText?: string;
  registerLabel?: string;
  registerValue?: number;
  isExecuting?: boolean;
  state?: 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';
  imageSrc?: string;
  imageSize?: number;
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
  registerLabel,
  registerValue,
  isExecuting = false,
  state = 'READY',
  imageSrc,
  imageSize = 385,
  scale = 1,
  className = ''
}) => {
  const isFacingRight = facing === 'right';

  if (imageSrc) {
    const imgScale = (imageSize / 1254) * scale;
    const defaultLabel = isFacingRight ? 'r1' : 'r2';
    const rLabel = registerLabel ?? defaultLabel;
    const showDynamicRegister = registerValue !== undefined && registerValue !== 0;

    return (
      <g
        className={`worker-character ${className}`}
        transform={`translate(${x}, ${y}) scale(${imgScale})`}
      >
        {/* Subtle active pedestal spotlight glow when executing */}
        {isExecuting && (
          <ellipse
            cx="0"
            cy="280"
            rx="420"
            ry="190"
            fill={isFacingRight ? 'rgba(139, 92, 246, 0.14)' : 'rgba(16, 185, 129, 0.14)'}
          />
        )}

        {/* Transparent ChatGPT Isometric Artwork (includes pill, pedestal, character, laptop, register badge) */}
        <image
          href={imageSrc}
          x={-627}
          y={-627}
          width={1254}
          height={1254}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Dynamic register value patch when register updates beyond initial 0 */}
        {showDynamicRegister && (
          isFacingRight ? (
            <g>
              <rect
                x={-86}
                y={208}
                width={260}
                height={92}
                rx={44}
                fill="#FDF5E8"
              />
              <text
                x={44.5}
                y={269}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="52"
                fontWeight="700"
                fill="#18181B"
              >
                {rLabel} = {registerValue}
              </text>
            </g>
          ) : (
            <g>
              <rect
                x={-168}
                y={231}
                width={282}
                height={94}
                rx={45}
                fill="#FBF4EA"
              />
              <text
                x={-26.5}
                y={293}
                textAnchor="middle"
                fontFamily="JetBrains Mono, monospace"
                fontSize="52"
                fontWeight="700"
              >
                <tspan fill="#15803D">{rLabel}</tspan>
                <tspan fill="#18181B"> = {registerValue}</tspan>
              </text>
            </g>
          )
        )}

        {/* Subtle Active / Blocked state chip below pedestal when stepping */}
        {isExecuting && (
          <g transform="translate(0, 485)">
            <rect
              x="-120"
              y="-34"
              width="240"
              height="68"
              rx="34"
              fill="#18181B"
              stroke={isFacingRight ? '#8B5CF6' : '#10B981'}
              strokeWidth="5"
            />
            <circle cx="-68" cy="0" r="11" fill={isFacingRight ? '#A78BFA' : '#34D399'} />
            <text
              x="16"
              y="13"
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize="34"
              fontWeight="700"
              fill="#FFFFFF"
              letterSpacing="0.04em"
            >
              ACTIVE
            </text>
          </g>
        )}
        {state === 'BLOCKED' && (
          <g transform="translate(0, 485)">
            <rect
              x="-135"
              y="-34"
              width="270"
              height="68"
              rx="34"
              fill="#7F1D1D"
              stroke="#EF4444"
              strokeWidth="5"
            />
            <text
              x="0"
              y="13"
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize="34"
              fontWeight="700"
              fill="#FFFFFF"
              letterSpacing="0.04em"
            >
              WAITING
            </text>
          </g>
        )}
      </g>
    );
  }

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

      {/* 2. Hand-Crafted Editorial Vector Fallback */}
      {isFacingRight ? (
        <g id="worker-a-artwork">
          <ellipse cx="-28" cy="12" rx="18" ry="6" fill="#3F3F46" stroke="#18181B" strokeWidth="1.25" />
          <path d="M -28 12 L -28 -10" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M -46 -8 C -48 -28 -44 -42 -38 -44 C -32 -46 -30 -30 -30 -12 Z"
            fill="#52525B"
            stroke="#18181B"
            strokeWidth="1.25"
          />
          <path
            d="M -34 -6 C -34 6 -24 16 -12 16 C -4 16 0 10 2 2 L -8 -6 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M -38 -18 C -40 -46 -22 -52 -4 -38 C 4 -26 4 -6 -2 4 C -12 8 -34 4 -38 -18 Z"
            fill={hoodieColor}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d="M -22 -40 Q -14 -22 -18 2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <ellipse cx="-14" cy="-54" rx="10" ry="12" fill="#FDE0B6" stroke="#18181B" strokeWidth="1.4" />
          <path
            d="M -24 -58 C -24 -70 -8 -72 -2 -62 C 2 -54 -2 -48 -4 -46 C -12 -46 -24 -48 -24 -58 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <path
            d="M -16 -24 Q -2 -18 8 -12 Q 16 -6 20 -2"
            fill="none"
            stroke={hoodieColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M -16 -24 Q -2 -18 8 -12 Q 16 -6 20 -2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse cx="20" cy="-2" rx="3.5" ry="2.5" fill="#FDE0B6" stroke="#18181B" strokeWidth="1" />
          <polygon points="10,0 34,-12 50,-4 26,8" fill="#94A3B8" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="34,-12 50,-4 50,-36 34,-44" fill="#1E293B" stroke="#18181B" strokeWidth="1.4" strokeLinejoin="round" />
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
        <g id="worker-b-artwork">
          <ellipse cx="28" cy="12" rx="18" ry="6" fill="#3F3F46" stroke="#18181B" strokeWidth="1.25" />
          <path d="M 28 12 L 28 -10" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M 46 -8 C 48 -28 44 -42 38 -44 C 32 -46 30 -30 30 -12 Z"
            fill="#52525B"
            stroke="#18181B"
            strokeWidth="1.25"
          />
          <path
            d="M 34 -6 C 34 6 24 16 12 16 C 4 16 0 10 -2 2 L 8 -6 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          <path
            d="M 38 -18 C 40 -46 22 -52 4 -38 C -4 -26 -4 -6 2 4 C 12 8 34 4 38 -18 Z"
            fill={hoodieColor}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <ellipse cx="14" cy="-54" rx="10" ry="12" fill="#FDE0B6" stroke="#18181B" strokeWidth="1.4" />
          <path
            d="M 24 -58 C 24 -70 8 -72 2 -62 C -2 -54 2 -48 4 -46 C 12 -46 24 -48 24 -58 Z"
            fill="#27272A"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="-68" r="5.5" fill="#18181B" stroke="#18181B" strokeWidth="1.2" />
          <path
            d="M 16 -24 Q 2 -18 -8 -12 Q -16 -6 -20 -2"
            fill="none"
            stroke={hoodieColor}
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 16 -24 Q 2 -18 -8 -12 Q -16 -6 -20 -2"
            fill="none"
            stroke="#18181B"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <ellipse cx="-20" cy="-2" rx="3.5" ry="2.5" fill="#FDE0B6" stroke="#18181B" strokeWidth="1" />
          <polygon points="-10,0 -34,-12 -50,-4 -26,8" fill="#94A3B8" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />
          <polygon points="-34,-12 -50,-4 -50,-36 -34,-44" fill="#1E293B" stroke="#18181B" strokeWidth="1.4" strokeLinejoin="round" />
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

      {isExecuting && (
        <g transform="translate(0, 22)">
          <rect x="-26" y="-7" width="52" height="14" rx="7" fill="#18181B" stroke="#10B981" strokeWidth="1" />
          <circle cx="-16" cy="0" r="2.5" fill="#10B981" />
          <text x="-8" y="3" fontFamily="Inter, system-ui, sans-serif" fontSize="8" fontWeight="700" fill="#FFFFFF">ACTIVE</text>
        </g>
      )}
    </g>
  );
};
