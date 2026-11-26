import React from 'react';

interface IsometricGridProps {
  width?: number;
  height?: number;
  className?: string;
}

export const IsometricGrid: React.FC<IsometricGridProps> = ({
  width = 780,
  height = 430,
  className = ''
}) => {
  return (
    <g className={`isometric-grid ${className}`} pointerEvents="none">
      <defs>
        {/* Crisp 30-degree isometric engineering floor grid */}
        <pattern
          id="iso-diamond-grid-pattern"
          width="64"
          height="36.95"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 32,0 L 64,18.475 L 32,36.95 L 0,18.475 Z"
            fill="none"
            stroke="#DBD7CE"
            strokeWidth="0.95"
          />
        </pattern>

        {/* Radial fade mask into #F6F4EF */}
        <radialGradient id="iso-grid-fade-mask" cx="50%" cy="50%" r="48%">
          <stop offset="38%" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0.45" />
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
