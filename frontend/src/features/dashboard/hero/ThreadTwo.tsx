import React from 'react';
import { ThreadComputeUnit } from './ThreadComputeUnit';

interface ThreadTwoProps {
  regValue: number;
  isActive: boolean;
  prefersReducedMotion: boolean | null;
}

/**
 * Thread 2 (T2 [R2]) isometric execution block with green status indicator.
 */
export const ThreadTwo: React.FC<ThreadTwoProps> = ({
  regValue,
  isActive,
  prefersReducedMotion
}) => (
  <g className="hero-thread-two">
    <ThreadComputeUnit
      cx={118}
      cy={328}
      pillLabel="T2 [R2]"
      registerName="R2"
      registerValue={regValue}
      statusColor="#059669"
      isActive={isActive}
      prefersReducedMotion={prefersReducedMotion}
    />
  </g>
);
