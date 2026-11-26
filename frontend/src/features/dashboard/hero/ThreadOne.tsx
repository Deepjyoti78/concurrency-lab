import React from 'react';
import { ThreadComputeUnit } from './ThreadComputeUnit';

interface ThreadOneProps {
  regValue: number;
  isActive: boolean;
  prefersReducedMotion: boolean | null;
}

/**
 * Thread 1 (T1 [R1]) isometric execution block with purple status indicator.
 */
export const ThreadOne: React.FC<ThreadOneProps> = ({
  regValue,
  isActive,
  prefersReducedMotion
}) => (
  <g className="hero-thread-one">
    <ThreadComputeUnit
      cx={118}
      cy={146}
      pillLabel="T1 [R1]"
      registerName="R1"
      registerValue={regValue}
      statusColor="#7C3AED"
      isActive={isActive}
      prefersReducedMotion={prefersReducedMotion}
    />
  </g>
);
