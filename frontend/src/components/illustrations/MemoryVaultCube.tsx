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
  imageSize?: number;
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
  imageSize = 315,
  scale = 1,
  className = ''
}) => {
  if (imageSrc) {
    const imgScale = (imageSize / 1254) * scale;
    const showDynamicValue = value !== 0 || isWriting || hasRaceConflict;
    const badgeFill = hasRaceConflict
      ? '#FEF3C7'
      : isWriting
      ? '#DCFCE7'
      : '#FBF0E6';

    return (
      <g
        className={`memory-vault-cube ${className}`}
        transform={`translate(${x}, ${y}) scale(${imgScale})`}
      >
        {/* Subtle read/write/conflict halo behind the vault */}
        {(isReading || isWriting || hasRaceConflict) && (
          <ellipse
            cx="0"
            cy="140"
            rx="340"
            ry="260"
            fill={
              hasRaceConflict
                ? 'rgba(245, 158, 11, 0.16)'
                : isWriting
                ? 'rgba(16, 185, 129, 0.14)'
                : 'rgba(139, 92, 246, 0.14)'
            }
          />
        )}

        {/* Transparent ChatGPT Shared Memory Artwork (includes Shared Memory pill, cube, x = 0 badge) */}
        <image
          href={imageSrc}
          x={-627}
          y={-627}
          width={1254}
          height={1254}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Dynamic variable value patch when memory updates or during writes/conflicts */}
        {showDynamicValue && (
          <g>
            <rect
              x={-164}
              y={140}
              width={327}
              height={114}
              rx={52}
              fill={badgeFill}
            />
            <text
              x={-0.5}
              y={217}
              textAnchor="middle"
              fontFamily="JetBrains Mono, monospace"
              fontSize="62"
              fontWeight="700"
              fill={hasRaceConflict ? '#92400E' : '#18181B'}
              letterSpacing="0.02em"
            >
              {variableName} = {value}
            </text>
          </g>
        )}

        {/* Race Hazard Alert Ribbon beneath cube */}
        {hasRaceConflict && (
          <g transform="translate(0, 455)">
            <rect
              x="-210"
              y="-40"
              width="420"
              height="80"
              rx="40"
              fill="#FEF3C7"
              stroke="#D97706"
              strokeWidth="5"
            />
            <text
              x="0"
              y="13"
              textAnchor="middle"
              fontFamily="Inter, system-ui, sans-serif"
              fontSize="36"
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
  }

  // Fallback vector geometry when no external imageSrc is passed
  const w = 58;
  const cos30 = 0.866;
  const sin30 = 0.5;
  const dx = w * cos30;
  const dy = w * sin30;
  const cubeHeight = 68;

  const topC = { x: 0, y: -dy };
  const rightC = { x: dx, y: 0 };
  const bottomC = { x: 0, y: dy };
  const leftC = { x: -dx, y: 0 };

  const bottomDown = { x: 0, y: dy + cubeHeight };
  const rightDown = { x: dx, y: cubeHeight };
  const leftDown = { x: -dx, y: cubeHeight };

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
      <ellipse cx="0" cy={dy + cubeHeight + 14} rx="68" ry="28" fill="rgba(24, 24, 27, 0.08)" />
      <g transform="translate(0, -68)">
        <rect x="-58" y="-13" width="116" height="26" rx="13" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.25" />
        <text x="0" y="4.5" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#18181B">
          Shared Memory
        </text>
      </g>
      <polygon points={`${leftC.x},${leftC.y} ${bottomC.x},${bottomC.y} ${bottomDown.x},${bottomDown.y} ${leftDown.x},${leftDown.y}`} fill={leftFill} stroke="#18181B" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={`${bottomC.x},${bottomC.y} ${rightC.x},${rightC.y} ${rightDown.x},${rightDown.y} ${bottomDown.x},${bottomDown.y}`} fill={rightFill} stroke="#18181B" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={`${topC.x},${topC.y} ${rightC.x},${rightC.y} ${bottomC.x},${bottomC.y} ${leftC.x},${leftC.y}`} fill={topFill} stroke="#18181B" strokeWidth="1.5" strokeLinejoin="round" />
      <ellipse cx="0" cy="0" rx="22" ry="11" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.25" />
      <circle cx="0" cy="-2" r="3.5" fill={hasRaceConflict ? '#D97706' : isWriting ? '#10B981' : isReading ? '#7C3AED' : '#9E381E'} />
      <g transform={`translate(0, ${dy + cubeHeight / 2 - 2})`}>
        <rect x="-34" y="-14" width="68" height="28" rx="6" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.3" />
        <text x="0" y="4.5" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="15" fontWeight="700" fill="#18181B">
          {variableName} = {value}
        </text>
      </g>
      {hasRaceConflict && (
        <g transform={`translate(0, ${dy + cubeHeight + 36})`}>
          <rect x="-56" y="-11" width="112" height="22" rx="11" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.25" />
          <text x="0" y="4" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="10" fontWeight="700" fill="#92400E">
            ⚠️ LOST UPDATE!
          </text>
        </g>
      )}
    </g>
  );
};
