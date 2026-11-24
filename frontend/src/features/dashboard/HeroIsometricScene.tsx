import React, { useState } from 'react';
import { IsometricGrid } from '../../components/illustrations/IsometricGrid';
import { IsometricPedestal } from '../../components/illustrations/IsometricPedestal';
import { WorkerCharacter } from '../../components/illustrations/WorkerCharacter';
import { MemoryVaultCube } from '../../components/illustrations/MemoryVaultCube';
import { AnimatedConnector } from '../../components/illustrations/AnimatedConnector';
import { StageDecorations } from '../../components/illustrations/StageDecorations';
import { ArrowRight, RotateCcw, Zap } from 'lucide-react';

interface HeroIsometricSceneProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

interface StepState {
  step: number;
  label: string;
  t1Op: string;
  t2Op: string;
  r1: number;
  r2: number;
  xVal: number;
  activeThread: 1 | 2 | null;
  flowDirectionA: 'forward' | 'backward' | 'idle';
  flowDirectionB: 'forward' | 'backward' | 'idle';
  isWritingA: boolean;
  isWritingB: boolean;
  isReadingA: boolean;
  isReadingB: boolean;
  hasRace: boolean;
  narrative: string;
}

const HERO_STEPS: StepState[] = [
  {
    step: 0,
    label: 'Init',
    t1Op: 'READY',
    t2Op: 'READY',
    r1: 0,
    r2: 0,
    xVal: 0,
    activeThread: null,
    flowDirectionA: 'idle',
    flowDirectionB: 'idle',
    isWritingA: false,
    isWritingB: false,
    isReadingA: false,
    isReadingB: false,
    hasRace: false,
    narrative: 'Initial State: Shared variable x = 0. Both threads are ready at their workstations.'
  },
  {
    step: 1,
    label: 'T1: Read',
    t1Op: 'READ_SHARED',
    t2Op: 'READY',
    r1: 0,
    r2: 0,
    xVal: 0,
    activeThread: 1,
    flowDirectionA: 'backward', // Memory -> Thread A
    flowDirectionB: 'idle',
    isWritingA: false,
    isWritingB: false,
    isReadingA: true,
    isReadingB: false,
    hasRace: false,
    narrative: 'Step 1: Thread A reads shared counter x (0) into local register r1.'
  },
  {
    step: 2,
    label: 'T2: Read',
    t1Op: 'READY',
    t2Op: 'READ_SHARED',
    r1: 0,
    r2: 0,
    xVal: 0,
    activeThread: 2,
    flowDirectionA: 'idle',
    flowDirectionB: 'forward', // Memory -> Thread B
    isWritingA: false,
    isWritingB: false,
    isReadingA: false,
    isReadingB: true,
    hasRace: false,
    narrative: 'Step 2: Context Switch! Thread B also reads shared counter x (0) into local register r2.'
  },
  {
    step: 3,
    label: 'T1: Add',
    t1Op: 'ADD_IMM',
    t2Op: 'READY',
    r1: 1,
    r2: 0,
    xVal: 0,
    activeThread: 1,
    flowDirectionA: 'idle',
    flowDirectionB: 'idle',
    isWritingA: false,
    isWritingB: false,
    isReadingA: false,
    isReadingB: false,
    hasRace: false,
    narrative: 'Step 3: Thread A increments its local register: r1 becomes 1 (0 + 1). Memory x is still 0.'
  },
  {
    step: 4,
    label: 'T2: Add',
    t1Op: 'READY',
    t2Op: 'ADD_IMM',
    r1: 1,
    r2: 1,
    xVal: 0,
    activeThread: 2,
    flowDirectionA: 'idle',
    flowDirectionB: 'idle',
    isWritingA: false,
    isWritingB: false,
    isReadingA: false,
    isReadingB: false,
    hasRace: false,
    narrative: 'Step 4: Thread B increments its local register: r2 becomes 1 (0 + 1). Both hold value 1.'
  },
  {
    step: 5,
    label: 'T1: Write',
    t1Op: 'WRITE_SHARED',
    t2Op: 'READY',
    r1: 1,
    r2: 1,
    xVal: 1,
    activeThread: 1,
    flowDirectionA: 'forward', // Thread A -> Memory
    flowDirectionB: 'idle',
    isWritingA: true,
    isWritingB: false,
    isReadingA: false,
    isReadingB: false,
    hasRace: false,
    narrative: 'Step 5: Thread A writes local r1 (1) back to shared counter. Shared memory x is now 1.'
  },
  {
    step: 6,
    label: 'T2: Overwrite',
    t1Op: 'TERMINATED',
    t2Op: 'WRITE_SHARED',
    r1: 1,
    r2: 1,
    xVal: 1,
    activeThread: 2,
    flowDirectionA: 'idle',
    flowDirectionB: 'backward', // Thread B -> Memory
    isWritingA: false,
    isWritingB: true,
    isReadingA: false,
    isReadingB: false,
    hasRace: true,
    narrative: 'Step 6: RACE CONDITION! Thread B writes its stale r2 (1) to x. Expected 2, actual value is 1 (Lost Update)!'
  }
];

export const HeroIsometricScene: React.FC<HeroIsometricSceneProps> = ({ onOpenWorkspace }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const current = HERO_STEPS[currentStepIdx];

  const handleNext = () => {
    setCurrentStepIdx(prev => (prev < HERO_STEPS.length - 1 ? prev + 1 : 0));
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 1. Main Isometric SVG Stage Viewport */}
      <div className="w-full relative rounded-2xl border border-[#DDD6CB] bg-[#FBF8F3] shadow-xs overflow-hidden">
        <svg
          viewBox="0 0 800 480"
          className="w-full h-auto select-none block"
          style={{ maxHeight: '460px' }}
        >
          {/* Subtle 30-degree isometric background diamond grid */}
          <IsometricGrid width={800} height={480} />

          {/* Plant & Coffee Stage Props */}
          <StageDecorations />

          {/* Left Pedestal (Thread A Workstation Plinth) */}
          <IsometricPedestal
            x={190}
            y={240}
            width={140}
            depth={90}
            height={20}
            pillValue={`r1 = ${current.r1}`}
            pillColor="#7C3AED"
          />

          {/* Right Pedestal (Thread B Workstation Plinth) */}
          <IsometricPedestal
            x={610}
            y={240}
            width={140}
            depth={90}
            height={20}
            pillValue={`r2 = ${current.r2}`}
            pillColor="#059669"
          />

          {/* Animated Connectors with Diamond Data Packets */}
          {/* Connector A: Thread A Workstation <---> Shared Memory Vault */}
          <AnimatedConnector
            x1={240}
            y1={215}
            x2={355}
            y2={185}
            direction={current.flowDirectionA}
            packetColor="#A78BFA"
            packetCount={4}
          />

          {/* Connector B: Shared Memory Vault <---> Thread B Workstation */}
          <AnimatedConnector
            x1={445}
            y1={185}
            x2={560}
            y2={215}
            direction={current.flowDirectionB}
            packetColor="#34D399"
            packetCount={4}
          />

          {/* Center 3D Shared Memory Vault Cube */}
          <MemoryVaultCube
            x={400}
            y={180}
            variableName="x"
            value={current.xVal}
            isWriting={current.isWritingA || current.isWritingB}
            isReading={current.isReadingA || current.isReadingB}
            hasRaceConflict={current.hasRace}
          />

          {/* Worker Character A (Lavender Hoodie, facing right) */}
          <WorkerCharacter
            x={190}
            y={225}
            name="Thread A"
            pillColor="#7C3AED"
            hoodieColor="#8B5CF6"
            facing="right"
            screenText={current.t1Op}
            isExecuting={current.activeThread === 1}
            state={current.activeThread === 1 ? 'RUNNING' : 'READY'}
          />

          {/* Worker Character B (Sage Green Hoodie, facing left) */}
          <WorkerCharacter
            x={610}
            y={225}
            name="Thread B"
            pillColor="#059669"
            hoodieColor="#10B981"
            facing="left"
            screenText={current.t2Op}
            isExecuting={current.activeThread === 2}
            state={current.activeThread === 2 ? 'RUNNING' : 'READY'}
          />
        </svg>

        {/* 2. Interactive Step Controller Bar directly below the stage */}
        <div className="w-full bg-[#F4EFE7] border-t border-[#E6E0D6] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Step selector chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleReset}
              title="Reset trace to initial state"
              className="p-1.5 rounded-lg border border-[#DDD6CB] bg-white text-[#57534E] hover:text-[#18181B] hover:bg-[#EFEAE2] transition-colors cursor-pointer mr-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {HERO_STEPS.map((s, idx) => (
              <button
                key={s.step}
                onClick={() => setCurrentStepIdx(idx)}
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                  currentStepIdx === idx
                    ? 'bg-[#18181B] text-white font-bold shadow-xs'
                    : 'bg-[#EFEAE2] text-[#57534E] hover:bg-[#E5DFD4] hover:text-[#18181B]'
                }`}
              >
                0{s.step}
              </button>
            ))}
          </div>

          {/* Action button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-[#9E381E] hover:bg-[#852E17] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>{currentStepIdx === HERO_STEPS.length - 1 ? 'Replay Trace' : 'Next step'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Live Explanatory Educational Narrative */}
      <div className="w-full mt-3 p-3.5 rounded-xl border border-[#E6E0D6] bg-[#FAF6EE] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
            current.hasRace ? 'bg-[#F59E0B]/20 text-[#B45309]' : 'bg-[#18181B]/10 text-[#18181B]'
          }`}>
            <Zap className="w-4 h-4" />
          </div>
          <p className="text-xs font-sans text-[#18181B] leading-relaxed truncate sm:text-clip">
            <strong className="font-semibold text-[#9E381E] mr-1.5">
              {current.hasRace ? '⚠️ Conflict Detected:' : `Step ${current.step}/6:`}
            </strong>
            {current.narrative}
          </p>
        </div>

        <button
          onClick={() => onOpenWorkspace('race_counter_2')}
          className="text-xs font-mono font-bold text-[#9E381E] hover:text-[#852E17] whitespace-nowrap flex items-center gap-1 flex-shrink-0 cursor-pointer ml-2"
        >
          <span>Open Full Lab</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
