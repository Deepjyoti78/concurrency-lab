import React from 'react';

interface IsometricGridProps {
  width?: number;
  height?: number;
  className?: string;
}

export const IsometricGrid: React.FC<IsometricGridProps> = ({
  width = 900,
  height = 540,
  className = ''
}) => {
  return (
    <g className={`isometric-grid ${className}`} pointerEvents="none">
      <defs>
        {/* Subtle 30-degree isometric diamond grid tile */}
        <pattern
          id="iso-diamond-grid-pattern"
          width="60"
          height="34.64"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 30,0 L 60,17.32 L 30,34.64 L 0,17.32 Z"
            fill="none"
            stroke="#EADBCE"
            strokeWidth="0.85"
            strokeDasharray="2,2"
          />
        </pattern>

        {/* Soft radial fade mask for seamless edge dissolution */}
        <radialGradient id="iso-grid-fade-mask" cx="50%" cy="48%" r="48%">
          <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <mask id="iso-grid-mask">
          <rect width={width} height={height} fill="url(#iso-grid-fade-mask)" />
        </mask>
      </defs>

      <rect
        width={width}
        height={height}
        fill="url(#iso-diamond-grid-pattern)"
        mask="url(#iso-grid-mask)"
      />
    </g>
  );
};
