import React, { useRef, useEffect } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { 
  Zap, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight,
  Terminal
} from 'lucide-react';

export const ExecutionTimeline: React.FC = () => {
  const { 
    currentRun, 
    currentStep, 
    isPlaying,
    seek, 
    getCurrentEvent, 
    stepForward, 
    stepBackward 
  } = useSimulationStore();
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const events = currentRun?.events || [];
  const totalSteps = events.length;
  const currentEvent = getCurrentEvent();

  // Auto-scroll ONLY during automatic playback, never fighting manual scrubber/clicks
  useEffect(() => {
    if (!isPlaying || !scrollContainerRef.current) return;
    const activeEl = scrollContainerRef.current.querySelector(`[data-step="${currentStep}"]`) as HTMLElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [currentStep, isPlaying]);

  const getThreadColor = (threadId?: number) => {
    if (threadId === 1) return '#6366F1';
    if (threadId === 2) return '#10B981';
    if (threadId === 3) return '#8B5CF6';
    if (threadId === 4) return '#F59E0B';
    return '#171717';
  };

  return (
    <div className="border-t border-[#E6E0D6] bg-[#F4EFE7] px-3 py-2 flex flex-col gap-1.5 flex-shrink-0 select-none">
      {/* 1. Header Bar: Step Info, Active Event Summary & Diagnostics */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs min-w-0">
        {/* Left: Step indicator & Navigation buttons */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <div className="flex items-center bg-[#EFEAE2] border border-[#DDD6CB] rounded-none p-0.5 flex-shrink-0">
            <button
              onClick={stepBackward}
              disabled={currentStep === 0}
              title="Step Backward"
              className="p-1 text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[#171717] font-bold px-2 py-0.5 text-[11px] whitespace-nowrap">
              Step {currentStep} <span className="text-[#78716C] font-normal">/ {totalSteps}</span>
            </span>
            <button
              onClick={stepForward}
              disabled={currentStep >= totalSteps}
              title="Step Forward"
              className="p-1 text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Event Disassembly & Explanation */}
          {currentEvent ? (
            <div className="flex items-center gap-1.5 font-mono text-[11px] min-w-0 max-w-xl truncate">
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: getThreadColor(currentEvent.threadId) }}
              />
              <span className="font-bold text-[#171717] flex-shrink-0">
                {currentEvent.threadName}:
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#EFEAE2] border border-[#DDD6CB] text-[#171717] font-bold flex-shrink-0 truncate max-w-[140px] sm:max-w-none">
                {currentEvent.instruction.disassembly}
              </span>
              <span className="text-[#57534E] font-sans truncate hidden md:inline">
                — {currentEvent.explanation}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[#78716C] font-mono text-[11px] truncate">
              <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Initial state. Step or play to start.</span>
            </div>
          )}
        </div>

        {/* Right: Detected Diagnostics */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {currentEvent?.raceDetected && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#F59E0B]" />
              <span>Race Conflict</span>
            </span>
          )}
          {currentEvent?.deadlockDetected && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              <span>Deadlock Cycle</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Sleek Debugger Timeline Track */}
      <div 
        ref={scrollContainerRef}
        className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin select-none"
      >
        {/* Step 0 Initial Marker */}
        <button
          onClick={() => seek(0)}
          data-step="0"
          className={`flex-shrink-0 px-2.5 py-1 rounded-none font-mono text-[10px] border transition-all cursor-pointer ${
            currentStep === 0
              ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-xs'
              : 'bg-[#FBF4EA] text-[#57534E] border-[#DDD6CB] hover:border-[#171717] hover:text-[#171717]'
          }`}
        >
          <div className="font-bold">#0 INIT</div>
        </button>

        {/* Subsequent Steps */}
        {events.map((ev) => {
          const isSelected = currentStep === ev.sequence;
          const isPast = ev.sequence < currentStep;
          const threadColor = getThreadColor(ev.threadId);

          return (
            <button
              key={ev.sequence}
              onClick={() => seek(ev.sequence)}
              data-step={ev.sequence}
              className={`flex-shrink-0 px-2 py-1 rounded-none font-mono text-[10px] border transition-all text-left cursor-pointer min-w-[76px] ${
                isSelected
                  ? 'bg-[#171717] text-white border-[#171717] font-bold shadow-xs ring-1 ring-[#171717]'
                  : isPast
                  ? 'bg-[#EFEAE2] text-[#171717] border-[#DDD6CB] hover:border-[#171717]'
                  : 'bg-[#FBF4EA] text-[#78716C] border-[#DDD6CB] hover:text-[#171717]'
              }`}
              style={isSelected ? { borderTopColor: threadColor, borderTopWidth: '3px' } : undefined}
            >
              <div className="flex items-center justify-between gap-1 text-[9px]">
                <span className={isSelected ? 'text-amber-300 font-bold' : 'text-[#78716C]'}>
                  #{ev.sequence}
                </span>
                <span 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: threadColor }}
                />
              </div>
              <div className="font-semibold truncate max-w-[90px]">
                {ev.instruction.opcode}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
