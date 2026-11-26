import React from 'react';
import { motion } from 'framer-motion';

export interface ThreadUnitProps {
  cx: number;
  cy: number;
  pillLabel: string;
  registerName: string;
  registerValue: number;
  statusColor: string;
  isActive: boolean;
  prefersReducedMotion: boolean | null;
}

/**
 * Monochromatic isometric thread compute node with a stationary floor plinth,
 * a smooth press-down upper </> module, status indicator pill, and dynamic register readout.
 */
export const ThreadComputeUnit: React.FC<ThreadUnitProps> = ({
  cx,
  cy,
  pillLabel,
  registerName,
  registerValue,
  statusColor,
  isActive,
  prefersReducedMotion
}) => (
  <g transform={`translate(${cx}, ${cy})`}>
    {/* Subtle monochromatic floor shadow */}
    <path
      d="M 0,-36 L 76,4 Q 80,6 76,8 L 0,48 L -76,8 Q -80,6 -76,4 Z"
      fill="#EAE7DF"
      opacity="0.65"
    />

    {/* Stationary Isometric Base Plinth */}
    <g>
      <path
        d="M -72,4 L -72,14 Q -72,18 -68,20 L -4,52 Q 0,54 4,52 L 68,20 Q 72,18 72,14 L 72,4 Z"
        fill="#E9E6DD"
        stroke="#141413"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 0,44 L 68,12 Q 72,10 72,6 L 72,14 Q 72,18 68,20 L 4,52 Q 0,54 0,50 Z"
        fill="#DCD8CE"
        stroke="#141413"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M -4,-34 Q 0,-36 4,-34 L 68,-2 Q 75,2 68,6 L 4,38 Q 0,40 -4,38 L -68,6 Q -75,2 -68,-2 Z"
        fill="#FAF9F5"
        stroke="#141413"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </g>

    {/* Upper Compute Module (moves smoothly down during execution; base stays fixed) */}
    <motion.g
      animate={
        prefersReducedMotion
          ? undefined
          : isActive
          ? { y: [0, 3.5, 0] }
          : { y: 0 }
      }
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      {/* Cap Side Skirt */}
      <path
        d="M -44,-14 L -44,-2 Q -44,1 -40,3 L -3,22 Q 0,24 3,22 L 40,3 Q 44,1 44,-2 L 44,-14 Z"
        fill="#EDEBE4"
        stroke="#141413"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M 0,14 L 40,-6 Q 44,-8 44,-12 L 44,-2 Q 44,1 40,3 L 3,22 Q 0,24 0,20 Z"
        fill="#DFDCD2"
        stroke="#141413"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Cap Top Surface */}
      <path
        d="M -3,-36 Q 0,-38 3,-36 L 41,-17 Q 46,-14 41,-11 L 3,8 Q 0,10 -3,8 L -41,-11 Q -46,-14 -41,-17 Z"
        fill="#FFFFFF"
        stroke="#141413"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* 4 Architectural Micro Vents on Front-Left Skirt */}
      <g stroke="#141413" strokeWidth="1.15" strokeLinecap="round">
        <line x1="-29" y1="-2" x2="-29" y2="5" />
        <line x1="-24" y1="0.5" x2="-24" y2="7.5" />
        <line x1="-19" y1="3" x2="-19" y2="10" />
        <line x1="-14" y1="5.5" x2="-14" y2="12.5" />
      </g>

      {/* Monochromatic </> Glyph on Cap Surface */}
      <text
        x="0"
        y="-10"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="13.5"
        fontWeight="700"
        fill="#141413"
        letterSpacing="0.02em"
      >
        &lt;/&gt;
      </text>

      {/* Vertical Stem + Top Rounded Pill Tag */}
      <line x1="0" y1="-37" x2="0" y2="-76" stroke="#141413" strokeWidth="1.2" />
      <g transform="translate(0, -90)">
        <rect
          x="-56"
          y="-14"
          width="112"
          height="28"
          rx="14"
          fill="#FFFFFF"
          stroke="#141413"
          strokeWidth="1.25"
        />
        <motion.circle
          cx="-36"
          cy="0"
          r="4.2"
          fill={statusColor}
          animate={
            prefersReducedMotion
              ? undefined
              : isActive
              ? { scale: [1, 1.35, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.55, ease: 'easeInOut' }}
        />
        <text
          x="10"
          y="4.2"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="700"
          fill="#141413"
          letterSpacing="0.03em"
        >
          {pillLabel}
        </text>
      </g>
    </motion.g>

    {/* Dynamic Register Pill Readout (R1 / R2) */}
    <g transform="translate(0, 62)">
      <rect
        x="-31"
        y="-11"
        width="62"
        height="22"
        rx="6"
        fill="#FFFFFF"
        stroke="#141413"
        strokeWidth="1.15"
      />
      <text
        x="0"
        y="3.8"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="10.5"
        fontWeight="700"
        fill="#141413"
      >
        {registerName} = {registerValue}
      </text>
    </g>
  </g>
);
