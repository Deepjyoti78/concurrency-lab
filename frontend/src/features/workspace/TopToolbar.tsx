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
    <div className="bg-[#F4EFE7] border-b border-[#E6E0D6] px-2.5 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs select-none w-full max-w-full min-w-0">
      {/* 1. Left: Single Unified Scenario Selector + Status Pill */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap min-w-0 flex-1 sm:flex-initial">
        {/* Scenario Select */}
        <div className="relative min-w-0 max-w-full">
          <select
            value={currentScenarioId}
            onChange={(e) => loadScenario(e.target.value)}
            className="w-full sm:w-auto max-w-[220px] sm:max-w-[280px] bg-[#FBF4EA] border border-[#DDD6CB] text-[#171717] font-semibold rounded pl-2 pr-6 py-1 text-xs focus:outline-none focus:border-[#171717] appearance-none cursor-pointer hover:bg-[#F2ECE3] transition-colors truncate"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-[#FBF4EA] text-[#171717]">
                {sc.title} ({sc.difficulty})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#78716C] absolute right-1.5 top-2 pointer-events-none" />
        </div>

        {/* Status Pill */}
        <div className="flex-shrink-0">
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 animate-pulse">
              <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
              <span>DEADLOCK</span>
            </span>
          ) : isRaceDetected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#B45309] border border-[#F59E0B]/30">
              <Zap className="w-3 h-3 text-[#F59E0B]" />
              <span>RACE DETECTED</span>
            </span>
          ) : isFinished ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#047857] border border-[#10B981]/30">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              <span>COMPLETED</span>
            </span>
          ) : isPlaying ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#171717] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
              <span>RUNNING</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EFEAE2] text-[#57534E] border border-[#DDD6CB]">
              <Clock className="w-2.5 h-2.5 text-[#78716C]" />
              <span>STEP {currentStep}/{totalSteps}</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Center: Combined Playback & Execution Speed Control Group */}
      <div className="flex items-center bg-[#EFEAE2] border border-[#DDD6CB] rounded p-0.5 shadow-none flex-shrink-0">
        <button
          onClick={reset}
          title="Reset to Step 0 (R)"
          className="p-1 rounded text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={stepBackward}
          disabled={currentStep === 0}
          title="Step Backward (Left Arrow)"
          className="p-1 rounded text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <SkipBack className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          className="px-2.5 py-1 rounded font-semibold text-xs flex items-center gap-1.5 bg-[#171717] hover:bg-[#262626] text-white transition-colors cursor-pointer"
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
          className="p-1 rounded text-[#57534E] hover:text-[#171717] hover:bg-[#E5DFD4] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Speed Selector integrated in the control group */}
        <div className="flex items-center border-l border-[#DDD6CB] pl-1 ml-1 gap-0.5">
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold transition-colors cursor-pointer ${
                speed === s 
                  ? 'bg-[#171717] text-white' 
                  : 'text-[#78716C] hover:text-[#171717]'
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
            className={`flex items-center gap-1.5 px-2 py-1 rounded border text-xs font-mono transition-colors cursor-pointer ${
              isSchedulerOpen 
                ? 'bg-[#171717] text-white border-[#171717]' 
                : 'bg-[#FBF4EA] text-[#171717] border-[#DDD6CB] hover:bg-[#F2ECE3]'
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
            <div className="absolute right-0 top-full mt-1 w-64 max-w-[calc(100vw-24px)] bg-[#FBF4EA] border border-[#DDD6CB] rounded-lg shadow-lg p-3 z-50 text-xs text-[#171717]">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E0D6] mb-2.5">
                <span className="font-bold font-mono text-[11px] uppercase text-[#78716C]">Scheduler Engine</span>
                <button 
                  onClick={() => setIsSchedulerOpen(false)}
                  className="text-[#78716C] hover:text-[#171717]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-mono text-[#78716C] uppercase font-bold mb-1">
                    Algorithm
                  </label>
                  <select
                    value={scheduler}
                    onChange={(e) => setSchedulerConfig(e.target.value)}
                    className="w-full bg-white border border-[#DDD6CB] text-[#171717] rounded px-2 py-1 text-xs font-mono font-semibold focus:outline-none"
                  >
                    <option value="rr">Round Robin</option>
                    <option value="fifo">FIFO (First-In, First-Out)</option>
                    <option value="random">Seeded Random</option>
                    <option value="manual">Manual Scheduling</option>
                  </select>
                </div>

                {scheduler === 'rr' && (
                  <div>
                    <label className="block text-[10px] font-mono text-[#78716C] uppercase font-bold mb-1">
                      Time Quantum (instructions)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={quantum}
                        onChange={(e) => setSchedulerConfig('rr', parseInt(e.target.value) || 1)}
                        className="flex-1 accent-[#171717]"
                      />
                      <span className="font-mono font-bold text-xs w-6 text-center bg-white border border-[#DDD6CB] py-0.5 rounded">
                        {quantum}
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-[#E6E0D6]">
                  <button
                    onClick={() => {
                      reRunNativeEngine();
                      setIsSchedulerOpen(false);
                    }}
                    disabled={isLoading}
                    className="w-full py-1.5 px-2 bg-[#171717] hover:bg-[#262626] text-white rounded font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Re-run C++ Simulation</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step Progress Display (hidden on mobile, visible on tablet/desktop) */}
        <div className="hidden lg:flex items-center gap-2 pl-1 border-l border-[#DDD6CB]">
          <div className="font-mono text-[11px] text-[#171717] font-bold whitespace-nowrap">
            {currentStep}<span className="text-[#78716C]">/{totalSteps}</span>
          </div>
          <div className="w-14 h-1.5 bg-[#E6E0D6] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#171717] transition-all duration-150"
              style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
