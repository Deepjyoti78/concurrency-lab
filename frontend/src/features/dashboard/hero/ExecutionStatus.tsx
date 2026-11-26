import React from 'react';

interface ExecutionStatusProps {
  label: string;
  activeActor: 't1' | 't2' | 'idle';
}

/**
 * Synchronized bottom telemetry readout displaying the active
 * pipeline phase and actor color dot.
 */
export const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ label, activeActor }) => {
  const dotFill =
    activeActor === 't1' ? '#7C3AED' : activeActor === 't2' ? '#059669' : '#141413';

  return (
    <g className="hero-execution-status" transform="translate(390, 408)">
      <circle cx="-204" cy="-3.5" r="2.6" fill={dotFill} />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        fontFamily="JetBrains Mono, monospace"
        fontSize="9.5"
        fontWeight="600"
        fill="#595751"
        letterSpacing="0.08em"
      >
        {label}
      </text>
    </g>
  );
};
