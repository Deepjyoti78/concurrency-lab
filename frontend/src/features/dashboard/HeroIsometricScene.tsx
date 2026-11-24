import React, { useState } from 'react';
import { IsometricGrid } from '../../components/illustrations/IsometricGrid';
import { IsometricPedestal } from '../../components/illustrations/IsometricPedestal';
import { WorkerCharacter } from '../../components/illustrations/WorkerCharacter';
import { MemoryVaultCube } from '../../components/illustrations/MemoryVaultCube';
import { AnimatedConnector } from '../../components/illustrations/AnimatedConnector';
import { ArrowRight, RotateCcw } from 'lucide-react';

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
    narrative: 'Step 3: Thread A increments local register: r1 becomes 1 (0 + 1). Memory x remains 0.'
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
    narrative: 'Step 4: Thread B increments local register: r2 becomes 1 (0 + 1). Both threads now hold 1.'
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
    <div className="w-full flex flex-col items-center select-none">
      {/* 1. Responsive Isometric Scene (Seamlessly blended into page background) */}
      <div className="w-full relative flex items-center justify-center">
        <svg
          viewBox="0 0 900 520"
          className="w-full h-auto select-none block max-h-[500px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Subtle 30-degree isometric background diamond grid with fading edges */}
          <IsometricGrid width={900} height={520} />

          {/* Left Pedestal (Thread A Workstation Plinth) */}
          <IsometricPedestal
            x={180}
            y={320}
            width={180}
            depth={100}
            height={22}
            pillValue={`r1 = ${current.r1}`}
            pillColor="#7C3AED"
          />

          {/* Right Pedestal (Thread B Workstation Plinth) */}
          <IsometricPedestal
            x={720}
            y={320}
            width={180}
            depth={100}
            height={22}
            pillValue={`r2 = ${current.r2}`}
            pillColor="#059669"
          />

          {/* Animated Connectors with Diamond Data Packets */}
          {/* Connector A: Thread A Workstation <---> Shared Memory Vault */}
          <AnimatedConnector
            x1={245}
            y1={270}
            x2={395}
            y2={195}
            direction={current.flowDirectionA}
            packetColor="#9B87F5"
            packetCount={4}
          />

          {/* Connector B: Shared Memory Vault <---> Thread B Workstation */}
          <AnimatedConnector
            x1={505}
            y1={195}
            x2={655}
            y2={270}
            direction={current.flowDirectionB}
            packetColor="#6EE7B7"
            packetCount={4}
          />

          {/* Center 3D Shared Memory Vault Cube */}
          <MemoryVaultCube
            x={450}
            y={160}
            variableName="x"
            value={current.xVal}
            isWriting={current.isWritingA || current.isWritingB}
            isReading={current.isReadingA || current.isReadingB}
            hasRaceConflict={current.hasRace}
            scale={1.05}
          />

          {/* Worker Character A (Lavender Hoodie, facing right-forward) */}
          <WorkerCharacter
            x={180}
            y={285}
            name="Thread A"
            pillColor="#7C3AED"
            hoodieColor="#8B5CF6"
            facing="right"
            screenText={current.t1Op}
            isExecuting={current.activeThread === 1}
            state={current.activeThread === 1 ? 'RUNNING' : 'READY'}
            scale={1.15}
          />

          {/* Worker Character B (Sage Green Hoodie, facing left-forward) */}
          <WorkerCharacter
            x={720}
            y={285}
            name="Thread B"
            pillColor="#059669"
            hoodieColor="#10B981"
            facing="left"
            screenText={current.t2Op}
            isExecuting={current.activeThread === 2}
            state={current.activeThread === 2 ? 'RUNNING' : 'READY'}
            scale={1.15}
          />
        </svg>
      </div>

      {/* 2. Sleek Floating Step Controls Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#DDD6CB] bg-[#FAF6EE]/95 shadow-xs backdrop-blur-xs mt-2">
        {/* Reset button */}
        <button
          type="button"
          onClick={handleReset}
          title="Reset trace to step 00"
          className="p-1.5 rounded-full text-[#78716C] hover:text-[#18181B] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
          aria-label="Reset trace"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-[#DDD6CB]" />

        {/* Step buttons 00 to 06 */}
        <div className="flex items-center gap-1">
          {HERO_STEPS.map((s, idx) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setCurrentStepIdx(idx)}
              className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
                currentStepIdx === idx
                  ? 'bg-[#18181B] text-white font-bold shadow-2xs'
                  : 'text-[#78716C] hover:text-[#18181B] hover:bg-[#EFEAE2]'
              }`}
              aria-label={`Step 0${s.step}: ${s.label}`}
            >
              0{s.step}
            </button>
          ))}
        </div>

        <div className="w-[1px] h-4 bg-[#DDD6CB]" />

        {/* Next Step / Replay button */}
        <button
          type="button"
          onClick={handleNext}
          className="px-3.5 py-1 rounded-full bg-[#9E381E] hover:bg-[#852E17] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-98"
        >
          <span>{currentStepIdx === HERO_STEPS.length - 1 ? 'Replay' : 'Next'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* 3. Minimal Explanatory Text Caption & Live Engine CTA */}
      <div className="mt-3 text-center space-y-1.5 max-w-xl mx-auto px-4">
        <p className="text-xs sm:text-sm font-sans text-[#18181B] leading-relaxed">
          <span className="font-semibold text-[#9E381E] mr-1.5">
            {current.hasRace ? '⚠️ Hazard Detected:' : `Step 0${current.step}:`}
          </span>
          {current.narrative}
        </p>
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-[#78716C]">
          <span>Interactive trace preview</span>
          <span>•</span>
          <button
            type="button"
            onClick={() => onOpenWorkspace('race_counter_2')}
            className="text-[#9E381E] hover:text-[#852E17] font-semibold underline underline-offset-2 cursor-pointer inline-flex items-center gap-0.5"
          >
            <span>Open live C++ execution in Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
