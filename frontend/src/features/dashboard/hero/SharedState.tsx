import React from 'react';
import { motion } from 'framer-motion';

interface SharedStateProps {
  cx?: number;
  cy?: number;
  value: number;
  isWriting: boolean;
  prefersReducedMotion: boolean | null;
}

const ORBIT_X = Array.from({ length: 13 }, (_, i) => +(Math.cos((i / 12) * Math.PI * 2) * 2.2).toFixed(2));
const ORBIT_Y = Array.from({ length: 13 }, (_, i) => +(Math.sin((i / 12) * Math.PI * 2) * 1.2).toFixed(2));

/**
 * Monochromatic Shared State (X) isometric cube with top 3-tier memory discs,
 * riveted front nameplate dynamically updating X = 0 / X = 1, and Shared State pill label.
 */
export const SharedState: React.FC<SharedStateProps> = ({
  cx = 598,
  cy = 178,
  value,
  isWriting,
  prefersReducedMotion
}) => (
  <g className="hero-shared-state" transform={`translate(${cx}, ${cy})`}>
    {/* Subtle floor shadow */}
    <path d="M 0,44 L 66,12 L 0,80 L -66,44 Z" fill="#EAE7DF" opacity="0.6" />

    {/* Stationary Isometric Storage Cube */}
    <path
      d="M -60,-10 L -60,36 Q -60,40 -56,42 L -3,70 Q 0,72 3,70 L 56,42 Q 60,40 60,36 L 60,-10 Z"
      fill="#F3F1EB"
      stroke="#141413"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M 0,24 L 60,-8 L 60,36 Q 60,40 56,42 L 3,70 Q 0,72 0,68 Z"
      fill="#E6E3DA"
      stroke="#141413"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
    <path
      d="M -3,-42 Q 0,-44 3,-42 L 57,-14 Q 63,-10 57,-6 L 3,22 Q 0,24 -3,22 L -57,-6 Q -63,-10 -57,-14 Z"
      fill="#FAF9F5"
      stroke="#141413"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />

    {/* Top Face Micro-Dots */}
    <circle cx="0" cy="-34" r="1.4" fill="#141413" />
    <circle cx="0" cy="14" r="1.4" fill="#141413" />
    <circle cx="-46" cy="-10" r="1.4" fill="#141413" />
    <circle cx="46" cy="-10" r="1.4" fill="#141413" />

    {/* Right Face Ventilation Slots */}
    <g stroke="#141413" strokeWidth="1.35" strokeLinecap="round">
      <line x1="25" y1="20" x2="25" y2="36" />
      <line x1="33" y1="16" x2="33" y2="32" />
      <line x1="41" y1="12" x2="41" y2="28" />
    </g>

    {/* Front-Left Riveted Nameplate displaying X */}
    <g transform="translate(-30, 32) skewY(26.5)">
      <rect
        x="-21"
        y="-14"
        width="42"
        height="28"
        rx="3"
        fill={isWriting ? '#EFECE4' : '#FFFFFF'}
        stroke="#141413"
        strokeWidth="1.15"
      />
      <circle cx="-16" cy="-9.5" r="1" fill="#141413" />
      <circle cx="16" cy="-9.5" r="1" fill="#141413" />
      <circle cx="-16" cy="9.5" r="1" fill="#141413" />
      <circle cx="16" cy="9.5" r="1" fill="#141413" />
      <text
        x="0"
        y="4.5"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="12"
        fontWeight="700"
        fill="#141413"
      >
        X = {value}
      </text>
    </g>

    {/* Top 3-Tier Stacked Disk Cylinder (smooth subtle circular platter motion on commit) */}
    <g transform="translate(0, -14)">
      {/* Bottom platter */}
      <motion.g
        animate={prefersReducedMotion ? undefined : { x: ORBIT_X, y: ORBIT_Y }}
        transition={{ duration: isWriting ? 1.8 : 3.8, repeat: Infinity, ease: 'linear', delay: 0 }}
      >
        <path
          d="M -25,-6 L -25,4 A 25,10.5 0 0 0 25,4 L 25,-6 Z"
          fill="#EAE7DF"
          stroke="#141413"
          strokeWidth="1.2"
        />
        <ellipse cx="0" cy="-6" rx="25" ry="10.5" fill="#F6F4EF" stroke="#141413" strokeWidth="1.2" />
      </motion.g>

      {/* Middle platter */}
      <motion.g
        animate={prefersReducedMotion ? undefined : { x: ORBIT_X, y: ORBIT_Y }}
        transition={{ duration: isWriting ? 1.8 : 3.8, repeat: Infinity, ease: 'linear', delay: 0.25 }}
      >
        <path
          d="M -25,-16 L -25,-6 A 25,10.5 0 0 0 25,-6 L 25,-16 Z"
          fill="#F1EFE9"
          stroke="#141413"
          strokeWidth="1.2"
        />
        <ellipse cx="0" cy="-16" rx="25" ry="10.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.2" />
      </motion.g>

      {/* Top platter */}
      <motion.g
        animate={prefersReducedMotion ? undefined : { x: ORBIT_X, y: ORBIT_Y }}
        transition={{ duration: isWriting ? 1.8 : 3.8, repeat: Infinity, ease: 'linear', delay: 0.5 }}
      >
        <path
          d="M -25,-26 L -25,-16 A 25,10.5 0 0 0 25,-16 L 25,-26 Z"
          fill="#F6F4EF"
          stroke="#141413"
          strokeWidth="1.2"
        />
        <ellipse cx="0" cy="-26" rx="25" ry="10.5" fill="#FFFFFF" stroke="#141413" strokeWidth="1.2" />
      </motion.g>
    </g>

    {/* Vertical Stem & Shared State (X) Label Pill */}
    <line x1="0" y1="-40" x2="0" y2="-92" stroke="#141413" strokeWidth="1.2" />
    <g transform="translate(0, -106)">
      <rect
        x="-78"
        y="-14"
        width="156"
        height="28"
        rx="14"
        fill="#FFFFFF"
        stroke="#141413"
        strokeWidth="1.25"
      />
      <circle cx="-59" cy="0" r="3.6" fill="#141413" />
      <text
        x="9"
        y="4.2"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="11"
        fontWeight="700"
        fill="#141413"
        letterSpacing="0.02em"
      >
        Shared State (X)
      </text>
    </g>
  </g>
);
