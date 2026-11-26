import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BackgroundGrid } from './hero/BackgroundGrid';
import { ConnectionPaths } from './hero/ConnectionPaths';
import { ThreadOne } from './hero/ThreadOne';
import { ThreadTwo } from './hero/ThreadTwo';
import { CPUScheduler } from './hero/CPUScheduler';
import { SharedState } from './hero/SharedState';
import { SyncLog } from './hero/SyncLog';
import { DataPackets } from './hero/DataPackets';
import { ExecutionStatus } from './hero/ExecutionStatus';

interface HeroIsometricSceneProps {
  onOpenWorkspace?: (scenarioId?: string) => void;
}

// Synchronized 5-step deterministic pipeline (~1.35s per beat):
// 0: Idle ready state (R1=0, R2=0, X=0)
// 1: T1 dispatches instruction -> CPU Scheduler (R1=1)
// 2: CPU Scheduler commits T1 write -> Shared State (X=1) -> SYNC_LOG
// 3: T2 dispatches instruction -> CPU Scheduler (R2=1)
// 4: CPU Scheduler commits T2 overwrite -> Shared State (X=1) -> SYNC_LOG
const TOTAL_PHASES = 5;

export const HeroIsometricScene: React.FC<HeroIsometricSceneProps> = () => {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setPhase((prev) => (prev + 1) % TOTAL_PHASES);
    }, 1350);
    return () => clearInterval(timer);
  }, [prefersReducedMotion]);

  const isT1Active = phase === 1;
  const isT1Write = phase === 2;
  const isT2Active = phase === 3;
  const isT2Write = phase === 4;

  const isCpuOut = isT1Write || isT2Write;
  const activeLane: 't1' | 't2' | 'cpuOut' | 'idle' = isT1Active
    ? 't1'
    : isT2Active
    ? 't2'
    : isCpuOut
    ? 'cpuOut'
    : 'idle';

  const pinPhase: 'in' | 'out' | 'idle' = isT1Active || isT2Active ? 'in' : isCpuOut ? 'out' : 'idle';
  const lastWriter: 't1' | 't2' = phase >= 3 ? 't2' : 't1';
  const activeActor: 't1' | 't2' | 'idle' =
    isT1Active || isT1Write ? 't1' : isT2Active || isT2Write ? 't2' : 'idle';

  const r1Val = phase >= 1 ? 1 : 0;
  const r2Val = phase >= 3 ? 1 : 0;
  const xVal = phase >= 2 ? 1 : 0;

  const statusLabel =
    phase === 0
      ? 'IDLE // READY_QUEUE [T1, T2]'
      : phase === 1
      ? 'T1 [R1] → CPU_SCHEDULER // READ & INC (R1=1)'
      : phase === 2
      ? 'CPU_SCHEDULER → SHARED_STATE // WRITE COMMIT (X=1)'
      : phase === 3
      ? 'T2 [R2] → CPU_SCHEDULER // CONTEXT_SWITCH (R2=1)'
      : 'CPU_SCHEDULER → SHARED_STATE // OVERWRITE HAZARD (X=1)';

  return (
    <div className="w-full flex items-center justify-center select-none">
      <svg
        viewBox="0 0 780 430"
        className="w-full h-auto select-none block"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Concurrency Lab architecture: Thread 1 and Thread 2 connected through CPU Scheduler to Shared State X and Sync Log"
      >
        <BackgroundGrid width={780} height={430} prefersReducedMotion={prefersReducedMotion} />

        <ConnectionPaths activePath={activeLane} />

        <ThreadOne
          regValue={r1Val}
          isActive={isT1Active}
          prefersReducedMotion={prefersReducedMotion}
        />

        <ThreadTwo
          regValue={r2Val}
          isActive={isT2Active}
          prefersReducedMotion={prefersReducedMotion}
        />

        <CPUScheduler
          cx={382}
          cy={220}
          pinPhase={pinPhase}
          prefersReducedMotion={prefersReducedMotion}
        />

        <SharedState
          cx={598}
          cy={178}
          value={xVal}
          isWriting={isCpuOut}
          prefersReducedMotion={prefersReducedMotion}
        />

        <SyncLog
          cx={710}
          cy={236}
          isSyncing={isCpuOut}
          prefersReducedMotion={prefersReducedMotion}
        />

        <DataPackets
          activeLane={activeLane}
          lastWriter={lastWriter}
          prefersReducedMotion={prefersReducedMotion}
        />

        <ExecutionStatus label={statusLabel} activeActor={activeActor} />
      </svg>
    </div>
  );
};
