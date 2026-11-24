import React from 'react';

interface IsometricPedestalProps {
  x: number;
  y: number;
  width?: number;   // isometric top face width (horizontal span)
  depth?: number;   // isometric top face depth (vertical span)
  height?: number;  // plinth vertical thickness
  pillValue?: string; // e.g. "r1 = 0"
  pillColor?: string;
  className?: string;
}

export const IsometricPedestal: React.FC<IsometricPedestalProps> = ({
  x,
  y,
  width = 160,
  depth = 90,
  height = 20,
  pillValue,
  pillColor = '#18181B',
  className = ''
}) => {
  const w = width / 2;
  const d = depth / 2;

  // 4 corners of the isometric top diamond centered at (x, y)
  const pTop = { x, y: y - d };
  const pRight = { x: x + w, y };
  const pBottom = { x, y: y + d };
  const pLeft = { x: x - w, y };

  // Extruded bottom corners (lowered by height)
  const pBottomLow = { x: pBottom.x, y: pBottom.y + height };
  const pRightLow = { x: pRight.x, y: pRight.y + height };
  const pLeftLow = { x: pLeft.x, y: pLeft.y + height };

  return (
    <g className={`isometric-pedestal ${className}`}>
      {/* 1. Plinth Ground Cast Shadow */}
      <ellipse
        cx={x}
        cy={y + d + height + 6}
        rx={w * 1.05}
        ry={d * 0.55}
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
        fill="#E8E2D8"
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
        fill="#DDD6CB"
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

      {/* 5. Front Embedded Register Pill (e.g. "r1 = 0") */}
      {pillValue && (
        <g transform={`translate(${x}, ${y + d + height / 2})`}>
          <rect
            x="-32"
            y="-10"
            width="64"
            height="20"
            rx="10"
            fill="#FFFFFF"
            stroke="#18181B"
            strokeWidth="1.25"
            filter="drop-shadow(0 1px 2px rgba(24, 24, 27, 0.08))"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize="11"
            fontWeight="700"
            fill={pillColor}
            letterSpacing="-0.02em"
          >
            {pillValue}
          </text>
        </g>
      )}
    </g>
  );
};
