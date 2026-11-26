import React from 'react';
import { motion } from 'framer-motion';

interface SyncLogProps {
  cx: number;
  cy: number;
  isSyncing: boolean;
  prefersReducedMotion: boolean | null;
}

/**
 * Monochromatic 3-tier persistence cylinder (SYNC_LOG) providing subtle
 * platter compression feedback when Shared State commits a write.
 */
export const SyncLog: React.FC<SyncLogProps> = ({
  cx,
  cy,
  isSyncing,
  prefersReducedMotion
}) => (
  <g className="hero-sync-log" transform={`translate(${cx}, ${cy})`}>
    {/* Subtle floor footprint */}
    <ellipse cx="0" cy="24" rx="22" ry="9" fill="#E6E3DA" opacity="0.55" />

    <motion.g
      animate={prefersReducedMotion ? undefined : isSyncing ? { y: [0, 1.8, 0] } : { y: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
    >
      {/* Bottom tier cylinder */}
      <path
        d="M -18,4 L -18,16 A 18,7.5 0 0 0 18,16 L 18,4 Z"
        fill="#EDEBE4"
        stroke="#141413"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="4" rx="18" ry="7.5" fill="#F7F5F0" stroke="#141413" strokeWidth="1.15" />

      {/* Middle tier cylinder */}
      <path
        d="M -18,-5 L -18,4 A 18,7.5 0 0 0 18,4 L 18,-5 Z"
        fill="#F2F0EA"
        stroke="#141413"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="-5" rx="18" ry="7.5" fill="#FAF9F5" stroke="#141413" strokeWidth="1.15" />

      {/* Top tier cylinder */}
      <path
        d="M -18,-14 L -18,-5 A 18,7.5 0 0 0 18,-5 L 18,-14 Z"
        fill="#F6F4EF"
        stroke="#141413"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <ellipse cx="0" cy="-14" rx="18" ry="7.5" fill="#FFFFFF" stroke="#141413" strokeWidth="1.15" />

      {/* Subtle monochrome commit activity ring on top platter */}
      <motion.ellipse
        cx="0"
        cy="-14"
        rx="9"
        ry="3.6"
        fill="none"
        stroke="#141413"
        strokeWidth="0.9"
        animate={
          prefersReducedMotion
            ? { opacity: 0.35 }
            : isSyncing
            ? { opacity: [0.35, 0.95, 0.35], scale: [0.95, 1.15, 1] }
            : { opacity: 0.25 }
        }
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </motion.g>

    <text
      x="0"
      y="40"
      textAnchor="middle"
      fontFamily="JetBrains Mono, monospace"
      fontSize="8.5"
      fontWeight="600"
      fill="#141413"
      letterSpacing="0.06em"
    >
      SYNC_LOG
    </text>
  </g>
);
