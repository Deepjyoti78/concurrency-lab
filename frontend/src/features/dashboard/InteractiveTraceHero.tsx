import React, { useState } from 'react';
import { ArrowUpRight, Zap, RefreshCw } from 'lucide-react';

interface InteractiveTraceHeroProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

interface StepData {
  step: string;
  t1: string;
  shared: string;
  t2: string;
  explanation: string;
  activeThread: 1 | 2;
  r1: number;
  r2: number;
  x: number;
}

const TRACE_STEPS: StepData[] = [
  {
    step: '01',
    t1: 'r1 ← x',
    shared: '—',
    t2: '—',
    explanation: 'Thread 1 reads shared counter x (0) into local register r1.',
    activeThread: 1,
    r1: 0,
    r2: 0,
    x: 0
  },
  {
    step: '02',
    t1: '—',
    shared: '—',
    t2: 'r2 ← x',
    explanation: 'Context switch! Thread 2 reads shared counter x (0) into local register r2.',
    activeThread: 2,
    r1: 0,
    r2: 0,
    x: 0
  },
  {
    step: '03',
    t1: 'r1 ← r1 + 1',
    shared: '—',
    t2: '—',
    explanation: 'Thread 1 increments its local register r1 (0 → 1).',
    activeThread: 1,
    r1: 1,
    r2: 0,
    x: 0
  },
  {
    step: '04',
    t1: '—',
    shared: '—',
    t2: 'r2 ← r2 + 1',
    explanation: 'Thread 2 increments its local register r2 (0 → 1).',
    activeThread: 2,
    r1: 1,
    r2: 1,
    x: 0
  },
  {
    step: '05',
    t1: 'x ← r1',
    shared: '—',
    t2: '—',
    explanation: 'Thread 1 writes r1 (1) back to shared counter x. x is now 1.',
    activeThread: 1,
    r1: 1,
    r2: 1,
    x: 1
  },
  {
    step: '06',
    t1: '—',
    shared: '—',
    t2: 'x ← r2',
    explanation: 'Race condition! Thread 2 overwrites x with stale r2 (1). Final x is 1 instead of 2 (Lost Update).',
    activeThread: 2,
    r1: 1,
    r2: 1,
    x: 1
  }
];

export const InteractiveTraceHero: React.FC<InteractiveTraceHeroProps> = ({ onOpenWorkspace }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const isInitial = currentStepIndex === 0;
  const currentStep = isInitial ? null : TRACE_STEPS[currentStepIndex - 1];

  const handleNext = () => {
    if (currentStepIndex < TRACE_STEPS.length) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      setCurrentStepIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
  };

  const currentX = currentStep ? currentStep.x : 0;
  const r1Val = currentStep ? currentStep.r1 : 0;
  const r2Val = currentStep ? currentStep.r2 : 0;
  const stepFormatted = currentStepIndex < 10 ? `0${currentStepIndex}` : `${currentStepIndex}`;
  const isRaceDetected = currentStepIndex === 6;

  return (
    <div className="w-full max-w-[640px] bg-[#1E1E1E] text-stone-200 border border-[#333333] shadow-2xl p-4 sm:p-6 text-xs select-none">
      {/* 1. Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#2C2C2C] text-[10px] font-mono tracking-wider">
        <div className="flex items-center gap-2 text-stone-300 uppercase">
          <span className="w-2 h-2 bg-[#9E381E] inline-block" />
          <span className="font-bold">TRY A TRACE</span>
          <span className="text-stone-500 hidden sm:inline">• INTERLEAVING SIMULATOR</span>
        </div>
        <button 
          onClick={() => onOpenWorkspace('race_counter_2')}
          title="Open in full workspace"
          className="text-stone-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 group"
        >
          <span>Open in workspace</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Header: Title + Math Formula */}
      <div className="flex items-baseline justify-between pt-3 pb-2">
        <div>
          <h2 className="font-editorial text-2xl sm:text-3xl text-stone-100 font-normal tracking-tight">
            Two-thread race
          </h2>
          <p className="text-[11px] text-stone-400 font-mono mt-0.5">
            Round-robin interleaved increments without mutual exclusion
          </p>
        </div>
        <span className="font-mono text-xs text-[#E0664B] tracking-wider font-semibold px-2 py-0.5 bg-[#9E381E]/20 border border-[#9E381E]/30">
          x = x + 1
        </span>
      </div>

      {/* 3. Register Monitors Bar */}
      <div className="grid grid-cols-3 gap-2 my-2 py-2 px-2.5 bg-[#171717] border border-[#2B2B2B] font-mono text-[11px]">
        {/* Thread 1 Register */}
        <div className="flex items-center justify-between border-r border-[#262626] pr-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#6366F1]" />
            <span className="text-stone-400">T1 reg:</span>
          </div>
          <span className={`font-bold ${currentStep?.activeThread === 1 ? 'text-amber-300' : 'text-stone-200'}`}>
            r1={r1Val}
          </span>
        </div>

        {/* Thread 2 Register */}
        <div className="flex items-center justify-between border-r border-[#262626] px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-stone-400">T2 reg:</span>
          </div>
          <span className={`font-bold ${currentStep?.activeThread === 2 ? 'text-emerald-300' : 'text-stone-200'}`}>
            r2={r2Val}
          </span>
        </div>

        {/* Active Scheduler state */}
        <div className="flex items-center justify-between pl-2 text-[10px]">
          <span className="text-stone-500">SCHED:</span>
          <span className="text-stone-300 font-semibold truncate">
            {currentStep ? `T${currentStep.activeThread} ACTIVE` : 'READY'}
          </span>
        </div>
      </div>

      {/* 4. Trace Grid Table */}
      <div className="border border-[#2C2C2C] bg-[#171717] my-3 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 text-[10px] font-mono uppercase tracking-wider text-stone-400 border-b border-[#2C2C2C] bg-[#1F1F1F]/80 px-2 py-1.5">
          <div className="col-span-2 text-stone-500 border-r border-[#2C2C2C] pr-2">Step</div>
          <div className="col-span-3 text-stone-300 border-r border-[#2C2C2C] px-2">Thread 1</div>
          <div className="col-span-4 text-center text-stone-400 border-r border-[#2C2C2C] px-2">Shared state</div>
          <div className="col-span-3 text-right text-stone-300 pl-2">Thread 2</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#262626] font-mono text-[11px]">
          {TRACE_STEPS.map((row, idx) => {
            const stepNum = idx + 1;
            const isActive = currentStepIndex === stepNum;
            const isCompleted = currentStepIndex > stepNum;

            return (
              <div 
                key={row.step}
                onClick={() => setCurrentStepIndex(stepNum)}
                className={`grid grid-cols-12 px-2 py-1.5 items-center cursor-pointer transition-colors ${
                  isActive 
                    ? 'bg-[#2B2B2B] text-white font-bold' 
                    : isCompleted
                    ? 'text-stone-400 hover:bg-[#202020]'
                    : 'text-stone-500 hover:bg-[#202020]'
                }`}
              >
                {/* Step Column */}
                <div className={`col-span-2 border-r border-[#262626] pr-2 ${isActive ? 'text-[#E0664B]' : 'text-stone-500'}`}>
                  {row.step}
                </div>

                {/* Thread 1 Column */}
                <div className="col-span-3 truncate text-stone-200 font-medium border-r border-[#262626] px-2">
                  {row.t1 !== '—' ? (
                    <span className={isActive && row.t1 !== '—' ? 'text-amber-200' : ''}>
                      {row.t1}
                    </span>
                  ) : (
                    <span className="text-stone-600">—</span>
                  )}
                </div>

                {/* Shared State Column */}
                <div className="col-span-4 text-center text-stone-500 text-[10px] border-r border-[#262626] px-2">
                  {isActive && row.step === '05' ? (
                    <span className="text-emerald-400 font-bold">x ← 1</span>
                  ) : isActive && row.step === '06' ? (
                    <span className="text-rose-400 font-bold">x ← 1 (race!)</span>
                  ) : isCompleted && row.step >= '05' ? (
                    <span className="text-stone-400 font-mono">x = 1</span>
                  ) : (
                    <span>—</span>
                  )}
                </div>

                {/* Thread 2 Column */}
                <div className="col-span-3 text-right truncate text-stone-200 font-medium pl-2">
                  {row.t2 !== '—' ? (
                    <span className={isActive && row.t2 !== '—' ? 'text-emerald-300' : ''}>
                      {row.t2}
                    </span>
                  ) : (
                    <span className="text-stone-600">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Race Detected Alert Banner */}
      {isRaceDetected && (
        <div className="mb-3 p-2.5 bg-[#9E381E]/20 border border-[#9E381E]/50 text-stone-200 flex items-start gap-2 text-[11px] animate-fadeIn">
          <Zap className="w-4 h-4 text-[#E0664B] flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#E0664B] uppercase tracking-wide">
              Lost Update Detected
            </span>
            <p className="text-stone-300 text-[10px] leading-relaxed">
              Thread 2 overwrote memory with register value 1, oblivious to Thread 1's prior increment. Final result is <strong>1</strong> instead of <strong>2</strong>.
            </p>
          </div>
        </div>
      )}

      {/* 6. Shared Counter Box & Context Description */}
      <div className="grid grid-cols-12 gap-3 py-2 items-center border-t border-[#2C2C2C]">
        <div className="col-span-4 sm:col-span-3 flex flex-col justify-center">
          <div className="text-[10px] font-mono text-stone-400 uppercase">
            Shared counter x
          </div>
          <div className="mt-1 flex items-center">
            <div className={`border px-3 py-1 font-mono text-base font-bold min-w-[36px] text-center transition-colors ${
              isRaceDetected 
                ? 'border-[#9E381E] bg-[#9E381E]/30 text-rose-200' 
                : 'border-[#3A3A3A] bg-[#141414] text-stone-100'
            }`}>
              {currentX}
            </div>
          </div>
        </div>

        <div className="col-span-8 sm:col-span-9 text-[11px] text-stone-300 leading-snug">
          {currentStep ? (
            <div>
              <span className="text-[#E0664B] font-mono font-bold mr-1">Step {currentStep.step}:</span>
              <span>{currentStep.explanation}</span>
            </div>
          ) : (
            <span className="text-stone-400">
              Both threads increment x. Step through their instructions to observe the non-atomic race window.
            </span>
          )}
        </div>
      </div>

      {/* 7. Control Bar: Reset, Step Count, Back, Next Step */}
      <div className="flex items-center justify-between pt-3 border-t border-[#2C2C2C]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset trace to step 00"
            className="p-1.5 rounded-none text-stone-400 hover:text-white hover:bg-[#2A2A2A] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-mono"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <span className="font-mono text-xs text-stone-400">
            {stepFormatted} <span className="text-stone-600">/ 06</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            title="Previous step"
            className="px-2.5 py-1.5 border border-[#3A3A3A] bg-[#222222] text-stone-300 hover:text-white hover:bg-[#2A2A2A] disabled:opacity-30 disabled:hover:bg-[#222222] transition-colors cursor-pointer text-xs"
          >
            ←
          </button>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-[#FAF6EE] hover:bg-white text-[#18181B] font-semibold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>{currentStepIndex >= TRACE_STEPS.length ? 'Restart trace' : 'Next step'}</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
