import React from 'react';

interface IsometricGridProps {
  width?: number;
  height?: number;
  className?: string;
}

export const IsometricGrid: React.FC<IsometricGridProps> = ({
  width = 800,
  height = 500,
  className = ''
}) => {
  return (
    <g className={`isometric-grid ${className}`} pointerEvents="none">
      <defs>
        <pattern
          id="iso-diamond-grid"
          width="60"
          height="34.64"
          patternUnits="userSpaceOnUse"
        >
          {/* Diamond isometric lines forming 30-degree isometric grid */}
          <path
            d="M 30,0 L 60,17.32 L 30,34.64 L 0,17.32 Z"
            fill="none"
            stroke="#EFE8DD"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </pattern>
      </defs>
      <rect width={width} height={height} fill="url(#iso-diamond-grid)" opacity={0.85} />
    </g>
  );
};
