import React from 'react';
import { DataPacket } from './DataPacket';

interface AnimatedConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  direction?: 'forward' | 'backward' | 'idle';
  packetColor?: string;
  packetCount?: number;
  className?: string;
}

export const AnimatedConnector: React.FC<AnimatedConnectorProps> = ({
  x1,
  y1,
  x2,
  y2,
  direction = 'idle',
  packetColor = '#9B87F5', // Muted lavender or sage green
  packetCount = 4,
  className = ''
}) => {
  const isActive = direction !== 'idle';

  // Compute positions along the line
  const packets = [];
  for (let i = 1; i <= packetCount; i++) {
    const fraction = i / (packetCount + 1);
    const px = x1 + (x2 - x1) * fraction;
    const py = y1 + (y2 - y1) * fraction;
    packets.push({ x: px, y: py, fraction });
  }

  // Directional arrow head position along the line
  const arrowFraction = direction === 'backward' ? 0.35 : 0.65;
  const arrowX = x1 + (x2 - x1) * arrowFraction;
  const arrowY = y1 + (y2 - y1) * arrowFraction;

  // Calculate line angle for arrowhead orientation
  const angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const arrowRot = direction === 'backward' ? angleDeg + 180 : angleDeg;

  return (
    <g className={`animated-connector ${className}`}>
      {/* 1. Underlying Isometric Dashed Wire */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? '#B8AFA0' : '#DED7CB'}
        strokeWidth="1.5"
        strokeDasharray="4,4"
      />

      {/* 2. Floating Diamond Data Packets along the pipeline */}
      {packets.map((p, idx) => (
        <g
          key={idx}
          opacity={isActive ? 1 : 0.3}
          className={isActive ? 'transition-opacity duration-300' : ''}
        >
          <DataPacket
            x={p.x}
            y={p.y}
            size={5.5}
            color={packetColor}
          />
        </g>
      ))}

      {/* 3. Subtle Directional Arrow Marker (Visible ONLY during active transfer) */}
      {isActive && (
        <g transform={`translate(${arrowX}, ${arrowY}) rotate(${arrowRot})`}>
          <polygon
            points="5,0 -4,-4 -2,0 -4,4"
            fill={packetColor}
            stroke="#18181B"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>
      )}
    </g>
  );
};
