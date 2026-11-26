import React from 'react';
import { motion } from 'framer-motion';

interface CPUSchedulerProps {
  cx?: number;
  cy?: number;
  pinPhase: 'in' | 'out' | 'idle';
  prefersReducedMotion: boolean | null;
}

const PIN_SLOTS = [-0.62, -0.31, 0, 0.31, 0.62];

/**
 * Monochromatic isometric CPU Scheduler IC package with stationary core body,
 * beveled top surface, corner micro-rivets, and 20 boundary L-pins that highlight
 * and actuate cleanly during read-dispatch vs. write-commit phases.
 */
export const CPUScheduler: React.FC<CPUSchedulerProps> = ({
  cx = 382,
  cy = 220,
  pinPhase,
  prefersReducedMotion
}) => {
  const isInputHighlight = pinPhase === 'in';
  const isOutputHighlight = pinPhase === 'out';

  return (
    <g className="hero-cpu-scheduler" transform={`translate(${cx}, ${cy})`}>
      {/* Subtle floor shadow */}
      <path
        d="M 0,-58 L 106,0 L 0,68 L -106,0 Z"
        fill="#EAE7DF"
        opacity="0.6"
      />

      {/* Back-Left Pins (highlight on input dispatch) */}
      <motion.g
        animate={
          prefersReducedMotion
            ? undefined
            : isInputHighlight
            ? { x: [0, -2.5, 0], y: [0, -1.4, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {PIN_SLOTS.map((t, idx) => {
          const px = -46 + t * 52;
          const py = -25 - t * 29;
          return (
            <polygon
              key={`bl-${idx}`}
              points={`${px},${py} ${px - 11},${py - 6} ${px - 5},${py - 9.5} ${px + 6},${py - 3.5}`}
              fill={isInputHighlight ? '#141413' : '#EAE7DF'}
              stroke="#141413"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          );
        })}
      </motion.g>

      {/* Back-Right Pins (highlight on output commit) */}
      <motion.g
        animate={
          prefersReducedMotion
            ? undefined
            : isOutputHighlight
            ? { x: [0, 2.5, 0], y: [0, -1.4, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {PIN_SLOTS.map((t, idx) => {
          const px = 46 + t * 52;
          const py = -25 + t * 29;
          return (
            <polygon
              key={`br-${idx}`}
              points={`${px},${py} ${px + 11},${py - 6} ${px + 5},${py - 9.5} ${px - 6},${py - 3.5}`}
              fill={isOutputHighlight ? '#141413' : '#DFDCD2'}
              stroke="#141413"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
          );
        })}
      </motion.g>

      {/* Stationary Core IC Package Skirt */}
      <path
        d="M -92,0 L -92,15 Q -92,20 -86,23 L -5,68 Q 0,71 5,68 L 86,23 Q 92,20 92,15 L 92,0 Z"
        fill="#E6E3DA"
        stroke="#141413"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M 0,54 L 86,6 Q 92,3 92,-2 L 92,15 Q 92,20 86,23 L 5,68 Q 0,71 0,66 Z"
        fill="#D6D2C7"
        stroke="#141413"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Stationary Core Ceramic Top Plate */}
      <path
        d="M -6,-51 Q 0,-54 6,-51 L 88,-5 Q 96,0 88,5 L 6,51 Q 0,54 -6,51 L -88,5 Q -96,0 -88,-5 Z"
        fill="#FAF9F5"
        stroke="#141413"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />

      {/* Inner Ceramic Groove & Corner Micro-Rivets */}
      <path
        d="M -4,-44 Q 0,-46 4,-44 L 78,-3 Q 84,0 78,3 L 4,44 Q 0,46 -4,44 L -78,3 Q -84,0 -78,-3 Z"
        fill="none"
        stroke="#141413"
        strokeWidth="0.85"
        strokeOpacity="0.65"
        strokeLinejoin="round"
      />
      <circle cx="0" cy="-36" r="2.6" fill="#FFFFFF" stroke="#141413" strokeWidth="1.1" />
      <circle cx="0" cy="36" r="2.6" fill="#FFFFFF" stroke="#141413" strokeWidth="1.1" />
      <circle cx="-64" cy="0" r="2.6" fill="#FFFFFF" stroke="#141413" strokeWidth="1.1" />
      <circle cx="64" cy="0" r="2.6" fill="#FFFFFF" stroke="#141413" strokeWidth="1.1" />

      {/* Monochrome Chip Label */}
      <text
        x="0"
        y="-4"
        textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#141413"
        letterSpacing="0.02em"
      >
        CPU
      </text>
      <text
        x="0"
        y="14"
        textAnchor="middle"
        fontFamily="Space Grotesk, sans-serif"
        fontSize="13.5"
        fontWeight="700"
        fill="#141413"
        letterSpacing="0.01em"
      >
        Scheduler
      </text>

      {/* Front-Left L-Shaped IC Pins (highlight on input dispatch) */}
      <motion.g
        animate={
          prefersReducedMotion
            ? undefined
            : isInputHighlight
            ? { x: [0, -2.5, 0], y: [0, 1.5, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {PIN_SLOTS.map((t, idx) => {
          const px = -46 + t * 52;
          const py = 27 + t * 29;
          return (
            <g key={`fl-${idx}`}>
              <polygon
                points={`${px},${py} ${px - 9},${py + 5} ${px - 9},${py + 19} ${px - 2},${py + 23} ${px - 2},${py + 9} ${px + 6},${py + 4.5}`}
                fill={isInputHighlight ? '#141413' : '#F3F1EB'}
                stroke="#141413"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <polygon
                points={`${px - 2},${py + 9} ${px + 5},${py + 5} ${px + 5},${py + 19} ${px - 2},${py + 23}`}
                fill={isInputHighlight ? '#2A2A28' : '#DCD8CE'}
                stroke="#141413"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </motion.g>

      {/* Front-Right L-Shaped IC Pins (highlight on output commit) */}
      <motion.g
        animate={
          prefersReducedMotion
            ? undefined
            : isOutputHighlight
            ? { x: [0, 2.5, 0], y: [0, 1.5, 0] }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        {PIN_SLOTS.map((t, idx) => {
          const px = 46 + t * 52;
          const py = 27 - t * 29;
          return (
            <g key={`fr-${idx}`}>
              <polygon
                points={`${px},${py} ${px + 9},${py + 5} ${px + 9},${py + 19} ${px + 2},${py + 23} ${px + 2},${py + 9} ${px - 6},${py + 4.5}`}
                fill={isOutputHighlight ? '#141413' : '#F3F1EB'}
                stroke="#141413"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
              <polygon
                points={`${px + 2},${py + 9} ${px - 5},${py + 5} ${px - 5},${py + 19} ${px + 2},${py + 23}`}
                fill={isOutputHighlight ? '#2A2A28' : '#D4D0C5'}
                stroke="#141413"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
      </motion.g>
    </g>
  );
};
