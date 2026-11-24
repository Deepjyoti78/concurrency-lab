import React from 'react';

interface MemoryVaultCubeProps {
  x: number;
  y: number;
  variableName?: string;
  value: number;
  isWriting?: boolean;
  isReading?: boolean;
  hasRaceConflict?: boolean;
  imageSrc?: string;
  scale?: number;
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
  imageSrc,
  scale = 1,
  className = ''
}) => {
  // Proportions of the prominent isometric cube
  const w = 58; // half width along 30 deg axis
  const cos30 = 0.866;
  const sin30 = 0.5;

  const dx = w * cos30; // ~50.2
  const dy = w * sin30; // 29
  const cubeHeight = 68;

  // 4 corners of top isometric diamond
  const topC = { x: 0, y: -dy };
  const rightC = { x: dx, y: 0 };
  const bottomC = { x: 0, y: dy };
  const leftC = { x: -dx, y: 0 };

  // Extruded bottom corners
  const bottomDown = { x: 0, y: dy + cubeHeight };
  const rightDown = { x: dx, y: cubeHeight };
  const leftDown = { x: -dx, y: cubeHeight };

  // Dynamic face colors based on active event
  const topFill = hasRaceConflict
    ? '#FEF3C7'
    : isWriting
    ? '#DCFCE7'
    : isReading
    ? '#F3E8FF'
    : '#FBE9E4';

  const leftFill = hasRaceConflict
    ? '#FDE68A'
    : isWriting
    ? '#BBF7D0'
    : isReading
    ? '#E9D5FF'
    : '#F5DDD6';

  const rightFill = hasRaceConflict
    ? '#FCD34D'
    : isWriting
    ? '#86EFAC'
    : isReading
    ? '#D8B4FE'
    : '#E8C5BC';

  return (
    <g
      className={`memory-vault-cube ${className}`}
      transform={`translate(${x}, ${y}) scale(${scale})`}
    >
      {/* 1. Ground Cast Shadow */}
      <ellipse
        cx="0"
        cy={dy + cubeHeight + 14}
        rx="68"
        ry="28"
        fill="rgba(24, 24, 27, 0.08)"
      />

      {/* 2. Floating Label Pill: Shared Memory */}
      <g transform="translate(0, -68)">
        <rect
          x="-58"
          y="-13"
          width="116"
          height="26"
          rx="13"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1.25"
          filter="drop-shadow(0 1px 2px rgba(24,24,27,0.06))"
        />
        <text
          x="0"
          y="4.5"
          textAnchor="middle"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="11"
          fontWeight="600"
          fill="#18181B"
          letterSpacing="-0.01em"
        >
          Shared Memory
        </text>
      </g>

      {/* 3. External Transparent Asset OR Hand-Crafted Isometric Vault */}
      {imageSrc ? (
        <g transform="translate(-65, -40)">
          <image
            href={imageSrc}
            x="0"
            y="0"
            width="130"
            height="130"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      ) : (
        <g id="vault-cube-geometry">
          {/* Left Extruded Face */}
          <polygon
            points={`
              ${leftC.x},${leftC.y}
              ${bottomC.x},${bottomC.y}
              ${bottomDown.x},${bottomDown.y}
              ${leftDown.x},${leftDown.y}
            `}
            fill={leftFill}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Extruded Face */}
          <polygon
            points={`
              ${bottomC.x},${bottomC.y}
              ${rightC.x},${rightC.y}
              ${rightDown.x},${rightDown.y}
              ${bottomDown.x},${bottomDown.y}
            `}
            fill={rightFill}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Top Diamond Face */}
          <polygon
            points={`
              ${topC.x},${topC.y}
              ${rightC.x},${rightC.y}
              ${bottomC.x},${bottomC.y}
              ${leftC.x},${leftC.y}
            `}
            fill={topFill}
            stroke="#18181B"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Top Face Inset Metallic Cylinder / Hub */}
          <ellipse
            cx="0"
            cy="0"
            rx="22"
            ry="11"
            fill="#FFFFFF"
            stroke="#18181B"
            strokeWidth="1.25"
          />
          <ellipse
            cx="0"
            cy="-2"
            rx="16"
            ry="8"
            fill="#F4EFE7"
            stroke="#18181B"
            strokeWidth="1"
          />
          <circle cx="0" cy="-2" r="3.5" fill={hasRaceConflict ? '#D97706' : isWriting ? '#10B981' : isReading ? '#7C3AED' : '#9E381E'} />

          {/* Subtle Isometric Face Etchings */}
          <line
            x1={leftC.x + 8}
            y1={leftC.y + 16}
            x2={bottomC.x - 8}
            y2={bottomC.y + 16}
            stroke="rgba(24, 24, 27, 0.12)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <line
            x1={bottomC.x + 8}
            y1={bottomC.y + 16}
            x2={rightC.x - 8}
            y2={rightC.y + 16}
            stroke="rgba(24, 24, 27, 0.12)"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        </g>
      )}

      {/* 4. Front Clear Unskewed Variable Badge: x = 0 / x = 1 (Readable on any display) */}
      <g transform={`translate(0, ${dy + cubeHeight / 2 - 2})`}>
        {/* Soft contrasting badge backing */}
        <rect
          x="-34"
          y="-14"
          width="68"
          height="28"
          rx="6"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="1.3"
          filter="drop-shadow(0 2px 4px rgba(24, 24, 27, 0.08))"
        />
        <text
          x="0"
          y="4.5"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="15"
          fontWeight="700"
          fill="#18181B"
          letterSpacing="0.02em"
        >
          {variableName} = {value}
        </text>
      </g>

      {/* 5. Race Hazard Alert Ribbon (Rendered below cube when hazard occurs) */}
      {hasRaceConflict && (
        <g transform={`translate(0, ${dy + cubeHeight + 36})`}>
          <rect
            x="-56"
            y="-11"
            width="112"
            height="22"
            rx="11"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="1.25"
            filter="drop-shadow(0 2px 4px rgba(217,119,6,0.15))"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fontFamily="Inter, system-ui, sans-serif"
            fontSize="10"
            fontWeight="700"
            fill="#92400E"
            letterSpacing="0.04em"
          >
            ⚠️ LOST UPDATE!
          </text>
        </g>
      )}
    </g>
  );
};
