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
  size = 7,
  color = '#A78BFA',
  outlineColor = '#18181B',
  label,
  className = ''
}) => {
  return (
    <g className={`data-packet ${className}`} transform={`translate(${x}, ${y})`}>
      {/* 3D Isometric Diamond/Octahedron */}
      <polygon
        points={`
          0,${-size} 
          ${size * 0.866},${-size * 0.5} 
          0,0 
          ${-size * 0.866},${-size * 0.5}
        `}
        fill={color}
        stroke={outlineColor}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <polygon
        points={`
          ${-size * 0.866},${-size * 0.5} 
          0,0 
          0,${size} 
          ${-size * 0.866},${size * 0.5}
        `}
        fill="#7C3AED"
        stroke={outlineColor}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <polygon
        points={`
          0,0 
          ${size * 0.866},${-size * 0.5} 
          ${size * 0.866},${size * 0.5} 
          0,${size}
        `}
        fill="#6D28D9"
        stroke={outlineColor}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {label && (
        <text
          x="0"
          y={-size - 3}
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
