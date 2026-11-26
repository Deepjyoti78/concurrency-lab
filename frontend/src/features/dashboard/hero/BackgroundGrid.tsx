import React from 'react';
import { motion } from 'framer-motion';
import { IsometricGrid } from '../../../components/illustrations/IsometricGrid';

interface BackgroundGridProps {
  width?: number;
  height?: number;
  prefersReducedMotion: boolean | null;
}

/**
 * Renders the subtle 30-degree isometric engineering floor grid,
 * corner registration brackets, and micro crosshair marks.
 */
export const BackgroundGrid: React.FC<BackgroundGridProps> = ({
  width = 780,
  height = 430,
  prefersReducedMotion
}) => (
  <g className="hero-background-grid">
    <IsometricGrid width={width} height={height} />

    {/* Corner Registration L-Brackets */}
    <g stroke="#141413" strokeWidth="1" fill="none" opacity="0.55">
      <polyline points="22,42 22,28 36,28" />
      <polyline points="744,28 758,28 758,42" />
      <polyline points="22,388 22,402 36,402" />
      <polyline points="744,402 758,402 758,388" />
    </g>

    {/* Subtle Micro Crosshair Reticles */}
    <motion.g
      stroke="#141413"
      strokeWidth="1"
      animate={prefersReducedMotion ? undefined : { opacity: [0.35, 0.75, 0.35] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <line x1="205" y1="14" x2="205" y2="24" />
      <line x1="200" y1="19" x2="210" y2="19" />
      <line x1="650" y1="364" x2="650" y2="374" />
      <line x1="645" y1="369" x2="655" y2="369" />
    </motion.g>
  </g>
);
