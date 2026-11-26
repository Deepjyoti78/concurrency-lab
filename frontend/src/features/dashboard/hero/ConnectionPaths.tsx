import React from 'react';

export const HERO_PATHS = {
  t1ToCpu: 'M 192,150 Q 222,154 234,186 Q 246,216 286,218',
  t2ToCpu: 'M 192,332 Q 242,332 254,296 Q 264,256 290,242',
  cpuToShared: 'M 476,222 Q 512,224 536,204',
  sharedToSync: 'M 656,220 L 690,236'
} as const;

interface ConnectionPathsProps {
  activePath: 't1' | 't2' | 'cpuOut' | 'idle';
}

/**
 * Fixed dashed architectural routing traces connecting T1, T2,
 * the CPU Scheduler, Shared State (X), and SYNC_LOG.
 */
export const ConnectionPaths: React.FC<ConnectionPathsProps> = ({ activePath }) => {
  const isT1 = activePath === 't1';
  const isT2 = activePath === 't2';
  const isCpuOut = activePath === 'cpuOut';

  return (
    <g className="hero-connection-paths" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d={HERO_PATHS.t1ToCpu}
        stroke="#141413"
        strokeWidth={isT1 ? 1.45 : 1.15}
        strokeOpacity={isT1 ? 0.92 : 0.65}
        strokeDasharray="4, 4.5"
      />
      <path
        d={HERO_PATHS.t2ToCpu}
        stroke="#141413"
        strokeWidth={isT2 ? 1.45 : 1.15}
        strokeOpacity={isT2 ? 0.92 : 0.65}
        strokeDasharray="4, 4.5"
      />
      <path
        d={HERO_PATHS.cpuToShared}
        stroke="#141413"
        strokeWidth={isCpuOut ? 1.5 : 1.15}
        strokeOpacity={isCpuOut ? 0.92 : 0.65}
        strokeDasharray="4, 4.5"
      />
      <path
        d={HERO_PATHS.sharedToSync}
        stroke="#141413"
        strokeWidth={isCpuOut ? 1.35 : 1.1}
        strokeOpacity={isCpuOut ? 0.9 : 0.6}
        strokeDasharray="3.5, 4"
      />
    </g>
  );
};
