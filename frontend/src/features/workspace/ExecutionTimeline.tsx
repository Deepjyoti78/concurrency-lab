import React, { useRef, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Zap, AlertTriangle } from 'lucide-react';

export const ExecutionTimeline: React.FC = () => {
  const { currentRun, currentStep, seek, getCurrentEvent } = useSimulationStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const events = currentRun?.events || [];
  const currentEvent = getCurrentEvent();

  // Keep active step scrolled into view smoothly
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentStep]);

  return (
    <div className="border-t border-[#1F2E4D] bg-[#0A0F1D] p-3 space-y-2">
      {/* Current Step Explanation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2 rounded-lg bg-[#0E1524] border border-[#1F2E4D] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-700/40 text-[11px]">
            Step {currentStep} of {events.length}
          </span>
          {currentEvent ? (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">{currentEvent.threadName}:</span>
              <span className="font-mono text-slate-300 bg-[#162035] px-2 py-0.5 rounded border border-[#1F2E4D]">
                {currentEvent.instruction.disassembly}
              </span>
              <span className="text-slate-400 font-normal hidden sm:inline">
                — {currentEvent.explanation}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Simulation initialized at step 0. Click Step or Play to begin.</span>
          )}
        </div>

        {/* Warning Indicators if active */}
        {currentEvent?.raceDetected && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Race Condition Detected
          </span>
        )}
        {currentEvent?.deadlockDetected && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            Deadlock Cycle Detected
          </span>
        )}
      </div>

      {/* Interactive Step Scrubber */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto py-2 px-1 select-none"
      >
        {/* Step 0 Initial Marker */}
        <button
          onClick={() => seek(0)}
          data-step="0"
          className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
            currentStep === 0
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold scale-105'
              : 'bg-[#111A2E] text-slate-400 border-[#1F2E4D] hover:border-slate-500 hover:text-slate-200'
          }`}
        >
          <div className="text-[9px] opacity-70">#0</div>
          <div>INIT</div>
        </button>

        {events.map((ev) => {
          const isSelected = currentStep === ev.sequence;
          const isPast = ev.sequence < currentStep;

          return (
            <button
              key={ev.sequence}
              onClick={() => seek(ev.sequence)}
              data-step={ev.sequence}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg font-mono text-[11px] border transition-all text-left cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg font-bold scale-105 z-10'
                  : isPast
                  ? 'bg-[#162035] text-slate-300 border-[#223354] hover:border-indigo-400'
                  : 'bg-[#0E1524] text-slate-500 border-[#1F2E4D]/60 hover:text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[9px] opacity-75">
                <span>#{ev.sequence}</span>
                <span className="truncate max-w-[60px]">{ev.threadName}</span>
              </div>
              <div className="font-bold truncate max-w-[120px]">
                {ev.instruction.opcode}
              </div>
              {ev.instruction.arg1 && (
                <div className="text-[9px] text-slate-400 truncate max-w-[120px]">
                  {ev.instruction.arg1}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
