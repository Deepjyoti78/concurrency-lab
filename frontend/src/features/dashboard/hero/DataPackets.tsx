import React from 'react';
import { HERO_PATHS } from './ConnectionPaths';

interface IsometricCubeProps {
  size?: number;
  variant: 'purple' | 'green';
}

const IsometricCube: React.FC<IsometricCubeProps> = ({ size = 5.4, variant }) => {
  const topFill = variant === 'purple' ? '#DDD6FE' : '#A7F3D0';
  const leftFill = variant === 'purple' ? '#A78BFA' : '#34D399';
  const rightFill = variant === 'purple' ? '#7C3AED' : '#059669';

  return (
    <g>
      <polygon
        points={`0,${-size} ${size * 0.866},${-size * 0.5} 0,0 ${-size * 0.866},${-size * 0.5}`}
        fill={topFill}
        stroke="#141413"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <polygon
        points={`${-size * 0.866},${-size * 0.5} 0,0 0,${size} ${-size * 0.866},${size * 0.5}`}
        fill={leftFill}
        stroke="#141413"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,0 ${size * 0.866},${-size * 0.5} ${size * 0.866},${size * 0.5} 0,${size}`}
        fill={rightFill}
        stroke="#141413"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </g>
  );
};

interface DataPacketsProps {
  activeLane: 't1' | 't2' | 'cpuOut' | 'idle';
  lastWriter: 't1' | 't2';
  prefersReducedMotion: boolean | null;
}

/**
 * Animated purple (T1) and green (T2) isometric data cubes traveling
 * smoothly along their respective dashed SVG connection paths.
 */
export const DataPackets: React.FC<DataPacketsProps> = ({
  activeLane,
  lastWriter,
  prefersReducedMotion
}) => {
  if (prefersReducedMotion) {
    return (
      <g className="hero-data-packets-static">
        <g transform="translate(234, 186)">
          <IsometricCube size={5.2} variant="purple" />
        </g>
        <g transform="translate(254, 296)">
          <IsometricCube size={5.2} variant="green" />
        </g>
        <g transform="translate(510, 214)">
          <IsometricCube size={5.2} variant={lastWriter === 't1' ? 'purple' : 'green'} />
        </g>
      </g>
    );
  }

  return (
    <g className="hero-data-packets">
      {/* T1 -> CPU Scheduler stream (purple cubes) */}
      {[0, -1.6, -3.2].map((delay, idx) => (
        <g key={`pkt-t1-${idx}`} opacity={activeLane === 't1' || activeLane === 'idle' ? 1 : 0.65}>
          <animateMotion
            path={HERO_PATHS.t1ToCpu}
            dur="4.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <IsometricCube size={5.4} variant="purple" />
        </g>
      ))}

      {/* T2 -> CPU Scheduler stream (green cubes) */}
      {[-0.8, -2.4, -4.0].map((delay, idx) => (
        <g key={`pkt-t2-${idx}`} opacity={activeLane === 't2' || activeLane === 'idle' ? 1 : 0.65}>
          <animateMotion
            path={HERO_PATHS.t2ToCpu}
            dur="4.8s"
            begin={`${delay}s`}
            repeatCount="indefinite"
          />
          <IsometricCube size={5.4} variant="green" />
        </g>
      ))}

      {/* CPU Scheduler -> Shared State interleaved write stream */}
      {[
        { delay: 0, variant: 'purple' as const },
        { delay: -1.65, variant: 'green' as const },
        { delay: -3.3, variant: 'purple' as const }
      ].map((pkt, idx) => (
        <g key={`pkt-out-${idx}`} opacity={activeLane === 'cpuOut' ? 1 : 0.78}>
          <animateMotion
            path={HERO_PATHS.cpuToShared}
            dur="4.95s"
            begin={`${pkt.delay}s`}
            repeatCount="indefinite"
          />
          <IsometricCube size={5.4} variant={pkt.variant} />
        </g>
      ))}

      {/* Shared State -> SyncLog commit packet */}
      <g opacity={activeLane === 'cpuOut' ? 1 : 0.65}>
        <animateMotion path={HERO_PATHS.sharedToSync} dur="2.7s" repeatCount="indefinite" />
        <IsometricCube size={4.4} variant={lastWriter === 't1' ? 'purple' : 'green'} />
      </g>
    </g>
  );
};
