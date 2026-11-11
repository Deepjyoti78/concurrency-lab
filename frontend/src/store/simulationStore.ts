import { create } from 'zustand';
import type { 
  ScenarioMetadata, 
  SimulationRunResult, 
  SimulationSnapshot, 
  ExecutionEvent 
} from '../types/simulation';
import defaultEngineData from '../generated/engineData.json';

interface SimulationState {
  scenarios: ScenarioMetadata[];
  currentScenarioId: string;
  currentRun: SimulationRunResult | null;
  currentStep: number;
  isPlaying: boolean;
  speed: number;
  scheduler: string;
  quantum: number;
  seed: number;
  selectedThreadId: number | null;
  isThreadPinned: boolean;
  activeView: 'lanes' | 'memory' | 'rag' | 'philosophers' | 'buffer';
  theme: 'dark' | 'light';
  isLoading: boolean;
  isBackendConnected: boolean;

  // Actions
  loadScenario: (scenarioId: string) => Promise<void>;
  stepForward: () => void;
  stepBackward: () => void;
  seek: (step: number) => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  setSchedulerConfig: (scheduler: string, quantum?: number, seed?: number) => void;
  selectThread: (threadId: number | null) => void;
  togglePinThread: () => void;
  pinThread: (threadId: number) => void;
  unpinThread: () => void;
  setActiveView: (view: 'lanes' | 'memory' | 'rag' | 'philosophers' | 'buffer') => void;
  toggleTheme: () => void;
  reRunNativeEngine: () => Promise<void>;
  checkBackendHealth: () => Promise<void>;

  // Getters
  getCurrentSnapshot: () => SimulationSnapshot | null;
  getCurrentEvent: () => ExecutionEvent | null;
}

const typedEngineData = defaultEngineData as unknown as {
  generatedAt: string;
  scenariosList: ScenarioMetadata[];
  runs: Record<string, SimulationRunResult>;
};

export const useSimulationStore = create<SimulationState>((set, get) => {
  const getThreadIdForStep = (step: number, run: SimulationRunResult | null, currentThreadId: number | null): number | null => {
    if (!run || !run.events || step === 0) {
      if (run?.snapshots && run.snapshots[0]?.threads) {
        const threadIds = Object.keys(run.snapshots[0].threads).map(Number);
        if (threadIds.length > 0) return threadIds[0];
      }
      return currentThreadId || 1;
    }
    const ev = run.events[step - 1];
    return ev?.threadId ?? currentThreadId ?? 1;
  };

  return {
    scenarios: typedEngineData.scenariosList || [],
    currentScenarioId: 'race_counter_2',
    currentRun: typedEngineData.runs['race_counter_2'] || null,
    currentStep: 0,
    isPlaying: false,
    speed: 1,
    scheduler: 'rr',
    quantum: 1,
    seed: 42,
    selectedThreadId: 1,
    isThreadPinned: false,
    activeView: 'lanes',
    theme: 'dark',
    isLoading: false,
    isBackendConnected: false,

  getCurrentSnapshot: () => {
    const { currentRun, currentStep } = get();
    if (!currentRun || !currentRun.snapshots || currentRun.snapshots.length === 0) return null;
    const clampedStep = Math.min(Math.max(0, currentStep), currentRun.snapshots.length - 1);
    return currentRun.snapshots[clampedStep] || null;
  },

  getCurrentEvent: () => {
    const { currentRun, currentStep } = get();
    if (!currentRun || !currentRun.events || currentStep === 0) return null;
    return currentRun.events[currentStep - 1] || null;
  },

  loadScenario: async (scenarioId: string) => {
    set({ isLoading: true, isPlaying: false });

    const scMeta = get().scenarios.find(s => s.id === scenarioId);
    let viewMode: 'lanes' | 'memory' | 'rag' | 'philosophers' | 'buffer' = 'lanes';

    if (scMeta) {
      if (scMeta.moduleId === 'dining-philosophers') viewMode = 'philosophers';
      else if (scMeta.moduleId === 'deadlocks') viewMode = 'rag';
      else if (scMeta.moduleId === 'producer-consumer') viewMode = 'buffer';
      else if (scMeta.moduleId === 'race-conditions') viewMode = 'lanes';
    }

    // Try fetching from local native backend first
    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          scheduler: scMeta?.defaultScheduler === 'ROUND_ROBIN' ? 'rr' : (scMeta?.defaultScheduler.toLowerCase() || 'rr'),
          quantum: scMeta?.defaultQuantum || 1,
          seed: 42
        })
      });

      if (res.ok) {
        const liveRun = await res.json();
        set({
          currentScenarioId: scenarioId,
          currentRun: liveRun,
          currentStep: 0,
          selectedThreadId: 1,
          activeView: viewMode,
          isLoading: false,
          isBackendConnected: true
        });
        return;
      }
    } catch {
      // Fallback to pre-generated authentic C++ run
    }

    const fallbackRun = typedEngineData.runs[scenarioId] || null;
    set({
      currentScenarioId: scenarioId,
      currentRun: fallbackRun,
      currentStep: 0,
      selectedThreadId: 1,
      activeView: viewMode,
      isLoading: false
    });
  },

  reRunNativeEngine: async () => {
    const { currentScenarioId, scheduler, quantum, seed } = get();
    set({ isLoading: true, isPlaying: false });

    try {
      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: currentScenarioId,
          scheduler,
          quantum,
          seed
        })
      });

      if (res.ok) {
        const freshRun = await res.json();
        set({
          currentRun: freshRun,
          currentStep: 0,
          isLoading: false,
          isBackendConnected: true
        });
        return;
      }
    } catch (err) {
      console.warn("Backend not accessible for live re-run, using cached run", err);
    }

    set({ isLoading: false });
  },

  stepForward: () => {
    const { currentRun, currentStep, isThreadPinned, selectedThreadId } = get();
    if (!currentRun || !currentRun.snapshots) return;
    if (currentStep < currentRun.snapshots.length - 1) {
      const nextStep = currentStep + 1;
      const nextThread = isThreadPinned 
        ? selectedThreadId 
        : getThreadIdForStep(nextStep, currentRun, selectedThreadId);
      set({ currentStep: nextStep, selectedThreadId: nextThread });
    } else {
      set({ isPlaying: false });
    }
  },

  stepBackward: () => {
    const { currentRun, currentStep, isThreadPinned, selectedThreadId } = get();
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      const nextThread = isThreadPinned 
        ? selectedThreadId 
        : getThreadIdForStep(prevStep, currentRun, selectedThreadId);
      set({ currentStep: prevStep, selectedThreadId: nextThread, isPlaying: false });
    }
  },

  seek: (step: number) => {
    const { currentRun, isThreadPinned, selectedThreadId } = get();
    if (!currentRun || !currentRun.snapshots) return;
    const clamped = Math.min(Math.max(0, step), currentRun.snapshots.length - 1);
    const nextThread = isThreadPinned 
      ? selectedThreadId 
      : getThreadIdForStep(clamped, currentRun, selectedThreadId);
    set({ currentStep: clamped, selectedThreadId: nextThread, isPlaying: false });
  },

  play: () => {
    const { currentRun, currentStep } = get();
    if (!currentRun) return;
    if (currentStep >= currentRun.snapshots.length - 1) {
      set({ currentStep: 0, isPlaying: true });
    } else {
      set({ isPlaying: true });
    }
  },

  pause: () => {
    set({ isPlaying: false });
  },

  reset: () => {
    const { currentRun, isThreadPinned, selectedThreadId } = get();
    const nextThread = isThreadPinned 
      ? selectedThreadId 
      : getThreadIdForStep(0, currentRun, selectedThreadId);
    set({ currentStep: 0, selectedThreadId: nextThread, isPlaying: false });
  },

  setSpeed: (speed: number) => {
    set({ speed });
  },

  setSchedulerConfig: (scheduler: string, quantum?: number, seed?: number) => {
    set(state => ({
      scheduler,
      quantum: quantum !== undefined ? quantum : state.quantum,
      seed: seed !== undefined ? seed : state.seed
    }));
  },

  selectThread: (threadId: number | null) => {
    set({ selectedThreadId: threadId });
  },

  togglePinThread: () => {
    const { isThreadPinned, currentRun, currentStep, selectedThreadId } = get();
    const willPin = !isThreadPinned;
    if (!willPin) {
      const syncedThread = getThreadIdForStep(currentStep, currentRun, selectedThreadId);
      set({ isThreadPinned: false, selectedThreadId: syncedThread });
    } else {
      set({ isThreadPinned: true });
    }
  },

  pinThread: (threadId: number) => {
    set({ isThreadPinned: true, selectedThreadId: threadId });
  },

  unpinThread: () => {
    const { currentRun, currentStep, selectedThreadId } = get();
    const syncedThread = getThreadIdForStep(currentStep, currentRun, selectedThreadId);
    set({ isThreadPinned: false, selectedThreadId: syncedThread });
  },

  setActiveView: (activeView) => {
    set({ activeView });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    set({ theme: newTheme });
  },

  checkBackendHealth: async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        set({ isBackendConnected: data.engineFound });
      }
    } catch {
      set({ isBackendConnected: false });
    }
  }
};
});
