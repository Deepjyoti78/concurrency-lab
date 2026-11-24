import React from 'react';

interface IsometricPedestalProps {
  x: number;
  y: number;
  width?: number;   // isometric top face width
  depth?: number;   // isometric top face depth
  height?: number;  // plinth thickness
  pillValue?: string; // e.g. "r1 = 0"
  pillColor?: string;
  className?: string;
}

export const IsometricPedestal: React.FC<IsometricPedestalProps> = ({
  x,
  y,
  width = 120,
  depth = 80,
  height = 16,
  pillValue,
  pillColor = '#18181B',
  className = ''
}) => {
  // 30 degree isometric vectors:
  // dx = cos(30 deg) = 0.866, dy = sin(30 deg) = 0.5
  const cos30 = 0.866;
  const sin30 = 0.5;

  const wX = (width / 2) * cos30;
  const dX = (depth / 2) * cos30;
  const dY = (depth / 2) * sin30;

  // Top face 4 corners:
  // Top corner
  const pTop = { x, y: y - dY };
  // Right corner
  const pRight = { x: x + wX, y: y };
  // Bottom corner
  const pBottom = { x: x + wX - dX, y: y + dY };
  // Left corner
  const pLeft = { x: x - dX, y: y };

  // Extruded bottom corners (down by height):
  const pBottomLow = { x: pBottom.x, y: pBottom.y + height };
  const pRightLow = { x: pRight.x, y: pRight.y + height };
  const pLeftLow = { x: pLeft.x, y: pLeft.y + height };

  return (
    <g className={`isometric-pedestal ${className}`}>
      {/* 1. Plinth Cast Shadow */}
      <ellipse
        cx={x + (wX - dX) / 2}
        cy={y + dY + height + 6}
        rx={width * 0.55}
        ry={depth * 0.3}
        fill="rgba(24, 24, 27, 0.08)"
      />

      {/* 2. Left Extruded Face */}
      <polygon
        points={`
          ${pLeft.x},${pLeft.y} 
          ${pBottom.x},${pBottom.y} 
          ${pBottomLow.x},${pBottomLow.y} 
          ${pLeftLow.x},${pLeftLow.y}
        `}
        fill="#E2DBD0"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 3. Right Extruded Face */}
      <polygon
        points={`
          ${pBottom.x},${pBottom.y} 
          ${pRight.x},${pRight.y} 
          ${pRightLow.x},${pRightLow.y} 
          ${pBottomLow.x},${pBottomLow.y}
        `}
        fill="#D4CCC0"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 4. Top Face */}
      <polygon
        points={`
          ${pTop.x},${pTop.y} 
          ${pRight.x},${pRight.y} 
          ${pBottom.x},${pBottom.y} 
          ${pLeft.x},${pLeft.y}
        `}
        fill="#FAF6EE"
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 5. Optional Front Embedded Register Pill (e.g. "r1 = 0") */}
      {pillValue && (
        <g transform={`translate(${pBottomLow.x - 28}, ${pBottomLow.y - 13})`}>
          <rect
            x="0"
            y="0"
            width="56"
            height="18"
            rx="9"
            fill="#FFFFFF"
            stroke="#18181B"
            strokeWidth="1.25"
          />
          <text
            x="28"
            y="12"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="10"
            fontWeight="bold"
            fill={pillColor}
          >
            {pillValue}
          </text>
        </g>
      )}
    </g>
  );
};
