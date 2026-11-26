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
  packetSize?: number;
  className?: string;
}

export const AnimatedConnector: React.FC<AnimatedConnectorProps> = ({
  x1,
  y1,
  x2,
  y2,
  direction = 'idle',
  packetColor = '#9B87F5',
  packetCount = 5,
  packetSize = 7.2,
  className = ''
}) => {
  const isActive = direction !== 'idle';

  const packets = [];
  for (let i = 1; i <= packetCount; i++) {
    const fraction = i / (packetCount + 1);
    const px = x1 + (x2 - x1) * fraction;
    const py = y1 + (y2 - y1) * fraction;
    packets.push({ x: px, y: py, fraction });
  }

  const angleDeg = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  const startArrowRot = angleDeg + 180;
  const endArrowRot = angleDeg;
  const activeArrowFraction = direction === 'backward' ? 0.14 : 0.86;
  const activeArrowX = x1 + (x2 - x1) * activeArrowFraction;
  const activeArrowY = y1 + (y2 - y1) * activeArrowFraction;
  const activeArrowRot = direction === 'backward' ? angleDeg + 180 : angleDeg;

  return (
    <g className={`animated-connector ${className}`}>
      {/* Underlying isometric dashed wire */}
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isActive ? '#8C8478' : '#C7BFB3'}
        strokeWidth="1.5"
        strokeDasharray="4,4"
      />

      {/* Subtle end arrowheads matching Image 2 */}
      {!isActive && (
        <>
          <g transform={`translate(${x1}, ${y1}) rotate(${startArrowRot})`}>
            <polyline
              points="-4,-3.5 1,0 -4,3.5"
              fill="none"
              stroke="#78716C"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
          <g transform={`translate(${x2}, ${y2}) rotate(${endArrowRot})`}>
            <polyline
              points="-4,-3.5 1,0 -4,3.5"
              fill="none"
              stroke="#78716C"
              strokeWidth="1.35"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </>
      )}

      {/* 3D Isometric Data Packet Cubes */}
      {packets.map((p, idx) => (
        <g
          key={idx}
          opacity={isActive ? 1 : 0.9}
          className={isActive ? 'animate-pulse' : ''}
        >
          <DataPacket
            x={p.x}
            y={p.y}
            size={packetSize}
            color={packetColor}
          />
        </g>
      ))}

      {/* Active directional flow arrow during live step transfers */}
      {isActive && (
        <g transform={`translate(${activeArrowX}, ${activeArrowY}) rotate(${activeArrowRot})`}>
          <polygon
            points="6,0 -5,-5 -2.5,0 -5,5"
            fill={packetColor}
            stroke="#18181B"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </g>
      )}
    </g>
  );
};
