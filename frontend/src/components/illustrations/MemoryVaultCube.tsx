import React from 'react';

interface MemoryVaultCubeProps {
  x: number;
  y: number;
  variableName?: string;
  value: number;
  isWriting?: boolean;
  isReading?: boolean;
  hasRaceConflict?: boolean;
  className?: string;
}

export const MemoryVaultCube: React.FC<MemoryVaultCubeProps> = ({
  x,
  y,
  variableName = 'x',
  value = 0,
  isWriting = false,
  isReading = false,
  hasRaceConflict = false,
  className = ''
}) => {
  // Dimensions of isometric cube
  const w = 48; // half width along 30 deg axis
  const cos30 = 0.866;
  const sin30 = 0.5;

  const dx = w * cos30; // ~41.5
  const dy = w * sin30; // 24
  const cubeHeight = 56;

  // 4 corners of top isometric diamond
  const topC = { x, y: y - dy };
  const rightC = { x: x + dx, y };
  const bottomC = { x, y: y + dy };
  const leftC = { x: x - dx, y };

  // Extruded bottom corners
  const bottomDown = { x, y: y + dy + cubeHeight };
  const rightDown = { x: x + dx, y: y + cubeHeight };
  const leftDown = { x: x - dx, y: y + cubeHeight };

  // Dynamic face colors based on active event
  const topFill = hasRaceConflict ? '#FEF3C7' : isWriting ? '#D1FAE5' : isReading ? '#EDE9FE' : '#F7E7E3';
  const leftFill = hasRaceConflict ? '#FDE68A' : isWriting ? '#A7F3D0' : isReading ? '#DDD6FE' : '#F2D7D1';
  const rightFill = hasRaceConflict ? '#FCD34D' : isWriting ? '#6EE7B7' : isReading ? '#C4B5FD' : '#E5C4BC';

  return (
    <g className={`memory-vault-cube ${className}`} transform={`translate(${x}, ${y})`}>
      {/* 1. Ground Plinth Cast Shadow */}
      <ellipse
        cx="0"
        cy={dy + cubeHeight + 10}
        rx="54"
        ry="24"
        fill="rgba(24, 24, 27, 0.08)"
      />

      {/* 2. Floating Label Pill: Shared Memory */}
      <g transform="translate(0, -56)">
        <rect
          x="-50"
          y="-11"
          width="100"
          height="22"
          rx="11"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1.25"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="600"
          fill="#18181B"
        >
          Shared Memory
        </text>
      </g>

      {/* 3. Left Extruded Face (Displays Variable Value: x = 0) */}
      <polygon
        points={`
          ${leftC.x - x},${leftC.y - y}
          ${bottomC.x - x},${bottomC.y - y}
          ${bottomDown.x - x},${bottomDown.y - y}
          ${leftDown.x - x},${leftDown.y - y}
        `}
        fill={leftFill}
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 4. Right Extruded Face */}
      <polygon
        points={`
          ${bottomC.x - x},${bottomC.y - y}
          ${rightC.x - x},${rightC.y - y}
          ${rightDown.x - x},${rightDown.y - y}
          ${bottomDown.x - x},${bottomDown.y - y}
        `}
        fill={rightFill}
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 5. Top Face */}
      <polygon
        points={`
          ${topC.x - x},${topC.y - y}
          ${rightC.x - x},${rightC.y - y}
          ${bottomC.x - x},${bottomC.y - y}
          ${leftC.x - x},${leftC.y - y}
        `}
        fill={topFill}
        stroke="#18181B"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* 6. Top Face Inset Disc / Cylinder Detail */}
      <ellipse
        cx="0"
        cy="0"
        rx="18"
        ry="9"
        fill="#FFFFFF"
        stroke="#18181B"
        strokeWidth="1.25"
      />
      <circle cx="0" cy="0" r="3" fill="#D97706" />

      {/* 7. Front Value Text: e.g. "x = 0" with isometric skew */}
      <g transform={`translate(-20, ${dy + 16}) skewY(30)`}>
        <text
          x="0"
          y="0"
          fontFamily="JetBrains Mono, monospace"
          fontSize="13"
          fontWeight="bold"
          fill="#18181B"
        >
          {variableName} = {value}
        </text>
      </g>

      {/* 8. Race Condition Amber Hazard Indicator */}
      {hasRaceConflict && (
        <g transform="translate(0, 82)">
          <rect
            x="-48"
            y="-10"
            width="96"
            height="20"
            rx="10"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="1.25"
          />
          <text
            x="0"
            y="3.5"
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="9"
            fontWeight="bold"
            fill="#B45309"
          >
            LOST UPDATE!
          </text>
        </g>
      )}
    </g>
  );
};
