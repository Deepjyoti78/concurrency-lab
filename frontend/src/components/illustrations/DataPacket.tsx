import React from 'react';

interface DataPacketProps {
  x: number;
  y: number;
  size?: number;
  color?: string;
  outlineColor?: string;
  label?: string;
  className?: string;
}

export const DataPacket: React.FC<DataPacketProps> = ({
  x,
  y,
  size = 6.5,
  color = '#9B87F5', // muted lavender
  outlineColor = '#1E1E1C',
  label,
  className = ''
}) => {
  // Subtle isometric lighting per face with refined thin boundary
  const isSage = color === '#6EE7B7' || color === '#34D399' || color === '#10B981' || color === '#A7F3D0';
  const topFacet = isSage ? '#A7F3D0' : '#C4B5FD';
  const leftFacet = isSage ? '#34D399' : '#8B5CF6';
  const rightFacet = isSage ? '#059669' : '#6D28D9';

  return (
    <g className={`data-packet ${className}`} transform={`translate(${x}, ${y})`}>
      {/* 3D Isometric Cube with Crisp Hairline Boundary */}
      {/* Top Diamond Face */}
      <polygon
        points={`
          0,${-size} 
          ${size * 0.866},${-size * 0.5} 
          0,0 
          ${-size * 0.866},${-size * 0.5}
        `}
        fill={topFacet}
        stroke={outlineColor}
        strokeWidth="0.6"
        strokeOpacity="0.82"
        strokeLinejoin="round"
      />
      {/* Left Shaded Face */}
      <polygon
        points={`
          ${-size * 0.866},${-size * 0.5} 
          0,0 
          0,${size} 
          ${-size * 0.866},${size * 0.5}
        `}
        fill={leftFacet}
        stroke={outlineColor}
        strokeWidth="0.6"
        strokeOpacity="0.82"
        strokeLinejoin="round"
      />
      {/* Right Shaded Face */}
      <polygon
        points={`
          0,0 
          ${size * 0.866},${-size * 0.5} 
          ${size * 0.866},${size * 0.5} 
          0,${size}
        `}
        fill={rightFacet}
        stroke={outlineColor}
        strokeWidth="0.6"
        strokeOpacity="0.82"
        strokeLinejoin="round"
      />
      {label && (
        <text
          x="0"
          y={-size - 4}
          textAnchor="middle"
          fontSize="8"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="bold"
          fill="#18181B"
        >
          {label}
        </text>
      )}
    </g>
  );
};
