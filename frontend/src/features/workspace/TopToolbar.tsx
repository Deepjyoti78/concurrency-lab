import React, { useEffect, useState, useRef } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ChevronDown, 
  RefreshCw,
  Sliders,
  X
} from 'lucide-react';

export const TopToolbar: React.FC = () => {
  const {
    currentScenarioId,
    scenarios,
    loadScenario,
    currentRun,
    currentStep,
    isPlaying,
    speed,
    scheduler,
    quantum,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    setSchedulerConfig,
    reRunNativeEngine,
    isLoading,
    getCurrentSnapshot,
    getCurrentEvent
  } = useSimulationStore();

  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const schedulerPopoverRef = useRef<HTMLDivElement>(null);

  const totalSteps = currentRun?.snapshots?.length ? currentRun.snapshots.length - 1 : 0;
  const currentEvent = getCurrentEvent();
  const currentSnapshot = getCurrentSnapshot();

  const isDeadlocked = currentSnapshot?.deadlockReport?.isDeadlocked || currentEvent?.deadlockDetected;
  const isRaceDetected = currentEvent?.raceDetected;
  const isFinished = currentStep >= totalSteps && totalSteps > 0;

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) pause();
        else play();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBackward, reset]);

  // Autoplay loop timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = Math.max(150, Math.floor(1000 / speed));
    const timer = setInterval(() => {
      const { currentStep: step, currentRun: run } = useSimulationStore.getState();
      const maxSteps = run?.snapshots?.length ? run.snapshots.length - 1 : 0;
      if (step < maxSteps) {
        useSimulationStore.getState().stepForward();
      } else {
        useSimulationStore.getState().pause();
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Close scheduler popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (schedulerPopoverRef.current && !schedulerPopoverRef.current.contains(e.target as Node)) {
        setIsSchedulerOpen(false);
      }
    };
    if (isSchedulerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSchedulerOpen]);

  const schedulerLabels: Record<string, string> = {
    rr: `Round Robin ${quantum ? `(q=${quantum})` : ''}`,
    fifo: 'FIFO',
    random: 'Seeded Random',
    manual: 'Manual'
  };

  return (
    <div className="bg-[#ECEAE3] border-b border-[#141413]/20 px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs select-none w-full max-w-full min-w-0">
      {/* 1. Left: Single Unified Scenario Selector + Status Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap min-w-0 flex-1 sm:flex-initial">
        {/* Scenario Select */}
        <div className="relative min-w-0 max-w-full">
          <select
            value={currentScenarioId}
            onChange={(e) => loadScenario(e.target.value)}
            className="w-full sm:w-auto max-w-[220px] sm:max-w-[280px] bg-[#FAF9F5] border border-[#141413]/30 text-[#141413] font-mono font-semibold rounded-none pl-2.5 pr-7 py-1 text-xs focus:outline-none focus:border-[#141413] appearance-none cursor-pointer hover:bg-white transition-colors truncate"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-[#FAF9F5] text-[#141413]">
                {sc.title} ({sc.difficulty})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#595751] absolute right-1.5 top-2 pointer-events-none" />
        </div>

        {/* Status Pill */}
        <div className="flex-shrink-0">
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#DC2626] border border-[#DC2626]/40 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
              <span>DEADLOCK</span>
            </span>
          ) : isRaceDetected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-[#9E381E]/15 text-[#9E381E] border border-[#9E381E]/40">
              <Zap className="w-3 h-3 text-[#9E381E]" />
              <span>RACE DETECTED</span>
            </span>
          ) : isFinished ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#047857] border border-[#047857]/35">
              <CheckCircle2 className="w-3 h-3 text-[#047857]" />
              <span>COMPLETED</span>
            </span>
          ) : isPlaying ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono font-bold bg-[#141413] text-[#F6F4EF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              <span>RUNNING</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono font-semibold bg-[#FAF9F5] text-[#595751] border border-[#141413]/25">
              <Clock className="w-2.5 h-2.5 text-[#595751]" />
              <span>STEP {currentStep}/{totalSteps}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Center: Combined Playback & Execution Speed Control Group */}
      <div className="flex items-center bg-[#E4E1D9] border border-[#141413]/30 rounded-none p-0.5 shadow-none flex-shrink-0">
        <button
          onClick={reset}
          title="Reset to Step 0 (R)"
          className="p-1 text-[#57534E] hover:text-[#141413] hover:bg-[#E5DFD4] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={stepBackward}
          disabled={currentStep === 0}
          title="Step Backward (Left Arrow)"
          className="p-1 text-[#57534E] hover:text-[#141413] hover:bg-[#E5DFD4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          className="px-2.5 py-1 font-semibold text-xs flex items-center gap-1.5 bg-[#9E381E] hover:bg-[#862E17] text-white transition-colors cursor-pointer"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3 h-3 fill-white" />
              <span className="text-[11px]">Pause</span>
            </>
          ) : (
            <>
              <Play className="w-3 h-3 fill-white" />
              <span className="text-[11px]">Play</span>
            </>
          )}
        </button>

        <button
          onClick={stepForward}
          disabled={isFinished}
          title="Step Forward (Right Arrow)"
          className="p-1 text-[#57534E] hover:text-[#141413] hover:bg-[#E5DFD4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Speed Selector integrated in the control group */}
        <div className="flex items-center border-l border-[#D5D1C7] pl-1 ml-1 gap-0.5">
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-colors cursor-pointer ${
                speed === s 
                  ? 'bg-[#141413] text-white' 
                  : 'text-[#78716C] hover:text-[#141413]'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 3. Right: Compact Scheduler Popover & Step Progress */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Scheduler Popover Button */}
        <div className="relative" ref={schedulerPopoverRef}>
          <button
            onClick={() => setIsSchedulerOpen(!isSchedulerOpen)}
            title="Configure Scheduler and Quantum"
            className={`flex items-center gap-1.5 px-2 py-1 border text-xs font-mono transition-colors cursor-pointer ${
              isSchedulerOpen 
                ? 'bg-[#141413] text-white border-[#141413]' 
                : 'bg-[#F6F4EF] text-[#141413] border-[#D5D1C7] hover:bg-[#F2ECE3]'
            }`}
          >
            <Sliders className="w-3 h-3 text-[#78716C]" />
            <span className="font-semibold text-[11px] truncate max-w-[120px] sm:max-w-none">
              {schedulerLabels[scheduler] || scheduler}
            </span>
            <ChevronDown className="w-3 h-3 text-[#78716C]" />
          </button>

          {/* Popover Content */}
          {isSchedulerOpen && (
            <div className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-24px)] bg-[#F6F4EF] border border-[#141413] rounded-none p-3 z-50 text-xs text-[#141413]">
              <div className="flex items-center justify-between pb-2 border-b border-dashed border-[#141413]/25 mb-2.5">
                <span className="font-bold font-mono text-[11px] uppercase text-[#141413]">SCHEDULER_ENGINE</span>
                <button 
                  onClick={() => setIsSchedulerOpen(false)}
                  className="text-[#595751] hover:text-[#141413]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-[#595751] uppercase font-bold mb-1">
                    Algorithm
                  </label>
                  <select
                    value={scheduler}
                    onChange={(e) => setSchedulerConfig(e.target.value)}
                    className="w-full bg-white border border-[#141413]/30 text-[#141413] rounded-none px-2 py-1 text-xs font-mono font-semibold focus:outline-none focus:border-[#141413]"
                  >
                    <option value="rr">Round Robin</option>
                    <option value="fifo">FIFO (First-In, First-Out)</option>
                    <option value="random">Seeded Random</option>
                    <option value="manual">Manual Scheduling</option>
                  </select>
                </div>

                {scheduler === 'rr' && (
                  <div>
                    <label className="block text-[10px] font-mono text-[#595751] uppercase font-bold mb-1">
                      Time Quantum (instructions)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={quantum}
                        onChange={(e) => setSchedulerConfig('rr', parseInt(e.target.value) || 1)}
                        className="flex-1 accent-[#141413]"
                      />
                      <span className="font-mono font-bold text-xs w-6 text-center bg-white border border-[#141413]/30 py-0.5 rounded-none">
                        {quantum}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-dashed border-[#141413]/25">
                  <button
                    onClick={() => {
                      reRunNativeEngine();
                      setIsSchedulerOpen(false);
                    }}
                    disabled={isLoading}
                    className="w-full py-1.5 px-2 bg-[#141413] hover:bg-[#27272A] text-[#F6F4EF] rounded-none font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>RE_RUN C++ SIMULATION</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Progress Display (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-[#D5D1C7]">
          <div className="font-mono text-[11px] text-[#141413] font-bold whitespace-nowrap">
            {currentStep}<span className="text-[#78716C]">/{totalSteps}</span>
          </div>
          <div className="w-14 h-1.5 bg-[#D5D1C7] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#141413] transition-all duration-150"
              style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
