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
  packetColor = '#A78BFA',
  packetCount = 4,
  className = ''
}) => {
  // Compute positions along the line for stationary or floating packets
  const packets = [];
  for (let i = 1; i <= packetCount; i++) {
    const fraction = i / (packetCount + 1);
    const px = x1 + (x2 - x1) * fraction;
    const py = y1 + (y2 - y1) * fraction;
    packets.push({ x: px, y: py });
  }

  // Directional arrow head position
  const arrowFraction = direction === 'backward' ? 0.2 : 0.8;
  const arrowX = x1 + (x2 - x1) * arrowFraction;
  const arrowY = y1 + (y2 - y1) * arrowFraction;

  return (
    <g className={`animated-connector ${className}`}>
      {/* 1. Underlying Isometric Dashed Wire */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="#D4CCC0"
        strokeWidth="1.5"
        strokeDasharray="4,4"
        className={direction !== 'idle' ? 'animate-pulse' : ''}
      />

      {/* 2. Floating Diamond Data Packets along the pipeline */}
      {packets.map((p, idx) => (
        <DataPacket
          key={idx}
          x={p.x}
          y={p.y}
          size={5.5}
          color={packetColor}
        />
      ))}

      {/* 3. Directional Arrow Marker */}
      {direction !== 'idle' && (
        <circle
          cx={arrowX}
          cy={arrowY}
          r="4"
          fill={direction === 'forward' ? '#10B981' : '#8B5CF6'}
          stroke="#18181B"
          strokeWidth="1"
        />
      )}
    </g>
  );
};
