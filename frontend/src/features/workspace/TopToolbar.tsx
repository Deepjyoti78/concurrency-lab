import React, { useEffect } from 'react';
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
  RefreshCw
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

  return (
    <div className="bg-[#0E1524] border-b border-[#1F2E4D] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
      {/* Left: Experiment Selection & Status */}
      <div className="flex items-center gap-3">
        <div>
          <label className="text-[10px] uppercase font-mono text-slate-500 block">Experiment</label>
          <div className="relative">
            <select
              value={currentScenarioId}
              onChange={(e) => loadScenario(e.target.value)}
              className="bg-[#162035] border border-[#1F2E4D] text-slate-100 font-medium rounded-md px-2.5 py-1 pr-7 text-xs focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-[#0E1524] text-slate-200">
                  {sc.title} ({sc.difficulty})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Status Pill */}
        <div className="pt-3">
          {isDeadlocked ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono font-medium animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              DEADLOCK DETECTED
            </span>
          ) : isRaceDetected ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-medium">
              <Zap className="w-3 h-3" />
              RACE CONDITION
            </span>
          ) : isFinished ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-medium">
              <CheckCircle2 className="w-3 h-3" />
              COMPLETED
            </span>
          ) : isPlaying ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-medium">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              RUNNING
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#162035] text-slate-400 border border-[#1F2E4D] font-mono">
              <Clock className="w-3 h-3" />
              READY / PAUSED
            </span>
          )}
        </div>
      </div>

      {/* Center: Playback Controls */}
      <div className="flex items-center gap-2 bg-[#162035] p-1 rounded-lg border border-[#1F2E4D]">
        <button
          onClick={reset}
          title="Reset (R)"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1E2B47] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={stepBackward}
          disabled={currentStep === 0}
          title="Step Backward (Left Arrow)"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1E2B47] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={isPlaying ? pause : play}
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          className={`px-3 py-1.5 rounded font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            isPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-white" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              Play
            </>
          )}
        </button>

        <button
          onClick={stepForward}
          disabled={isFinished}
          title="Step Forward (Right Arrow)"
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#1E2B47] disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed Selector */}
        <div className="flex items-center gap-0.5 border-l border-[#1F2E4D] pl-2 ml-1">
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 py-0.5 rounded font-mono text-[10px] cursor-pointer ${
                speed === s 
                  ? 'bg-indigo-600/30 text-indigo-300 font-bold border border-indigo-500/40' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Right: Scheduler Selection & Native Engine Trigger */}
      <div className="flex items-center gap-3">
        {/* Scheduler Config */}
        <div className="flex items-center gap-2">
          <div>
            <label className="text-[10px] uppercase font-mono text-slate-500 block">Scheduler</label>
            <select
              value={scheduler}
              onChange={(e) => {
                setSchedulerConfig(e.target.value);
              }}
              className="bg-[#162035] border border-[#1F2E4D] text-slate-200 rounded px-2 py-1 text-xs font-mono focus:outline-none cursor-pointer"
            >
              <option value="rr">Round Robin</option>
              <option value="fifo">FIFO</option>
              <option value="random">Seeded Random</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {scheduler === 'rr' && (
            <div>
              <label className="text-[10px] uppercase font-mono text-slate-500 block">Quantum</label>
              <input
                type="number"
                min="1"
                max="10"
                value={quantum}
                onChange={(e) => setSchedulerConfig('rr', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-12 bg-[#162035] border border-[#1F2E4D] text-slate-200 rounded px-1.5 py-1 text-xs font-mono text-center focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Re-run Native C++ Engine button */}
        <div className="pt-3">
          <button
            onClick={reRunNativeEngine}
            disabled={isLoading}
            title="Execute native C++ engine with active scheduler parameters"
            className="px-2.5 py-1 rounded bg-[#162035] hover:bg-[#1E2B47] text-slate-300 hover:text-white border border-[#1F2E4D] font-mono text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Re-run C++</span>
          </button>
        </div>

        {/* Step Progress Counter */}
        <div className="pt-3 text-right">
          <div className="font-mono text-xs text-slate-300 font-semibold">
            Step {currentStep} <span className="text-slate-500">/ {totalSteps}</span>
          </div>
          <div className="w-24 h-1.5 bg-[#162035] rounded-full overflow-hidden mt-1 border border-[#1F2E4D]">
            <div 
              className="h-full bg-indigo-500 transition-all duration-150"
              style={{ width: `${totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
