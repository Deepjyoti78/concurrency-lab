import React, { useEffect, useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { WorkspaceBlueprintStage } from './WorkspaceBlueprintStage';
import { ThreadLanes } from '../visualization/ThreadLanes';
import { SharedMemoryView } from '../visualization/SharedMemoryView';
import { ResourceAllocationGraph } from '../visualization/ResourceAllocationGraph';
import { DiningTable } from '../visualization/DiningTable';
import { BoundedBuffer } from '../visualization/BoundedBuffer';
import { RaceAnalysisModal } from '../visualization/RaceAnalysisModal';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Zap
} from 'lucide-react';

type StageMode = 'blueprint' | 'lanes' | 'memory' | 'rag' | 'philosophers' | 'buffer';

const SCENARIO_CPP_SOURCE: Record<string, { file: string; lines: string[] }> = {
  race_counter_2: {
    file: 'main.cpp',
    lines: [
      '#include <thread>',
      '#include <iostream>',
      '',
      'int counter = 0; // shared state X',
      '',
      'void worker() {',
      '  int r = counter;  // READ_SHARED',
      '  r = r + 1;        // ADD_IMM 1',
      '  counter = r;      // WRITE_SHARED (unsync)',
      '}'
    ]
  },
  race_counter_3: {
    file: 'main.cpp',
    lines: [
      '#include <thread>',
      '#include <vector>',
      '',
      'int counter = 0; // 3-thread race target',
      '',
      'void worker(int tid) {',
      '  int reg = counter; // preemptible read',
      '  reg += 1;          // local increment',
      '  counter = reg;     // overwrites prior write',
      '}'
    ]
  },
  mutex_counter_2: {
    file: 'main.cpp',
    lines: [
      '#include <thread>',
      '#include <mutex>',
      '',
      'int counter = 0;',
      'std::mutex mtx;',
      '',
      'void safe_worker() {',
      '  std::lock_guard<std::mutex> lock(mtx);',
      '  counter += 1; // serialized critical section',
      '}'
    ]
  },
  deadlock_circular_wait: {
    file: 'main.cpp',
    lines: [
      '#include <mutex>',
      'std::mutex mtx_A, mtx_B;',
      '',
      'void thread_1() {',
      '  mtx_A.lock(); mtx_B.lock(); // A -> B',
      '}',
      'void thread_2() {',
      '  mtx_B.lock(); mtx_A.lock(); // B -> A (cycle)',
      '}'
    ]
  },
  mutex_contention: {
    file: 'main.cpp',
    lines: [
      '#include <mutex>',
      '',
      'int counter = 0;',
      'std::mutex mtx;',
      '',
      'void worker() {',
      '  mtx.lock();     // contended wait queue',
      '  counter += 1;   // exclusive increment',
      '  mtx.unlock();   // wake next waiter',
      '}'
    ]
  },
  counting_semaphore: {
    file: 'main.cpp',
    lines: [
      '#include <semaphore>',
      '',
      'std::counting_semaphore<2> slots(2);',
      '',
      'void worker() {',
      '  slots.acquire(); // P(): decrement permit',
      '  access_pool();   // up to 2 concurrent',
      '  slots.release(); // V(): restore permit',
      '}'
    ]
  },
  producer_consumer_3: {
    file: 'main.cpp',
    lines: [
      '#include <mutex>',
      '#include <semaphore>',
      '',
      'std::mutex buf_mtx;',
      'int buffer_count = 0, capacity = 3;',
      '',
      'void producer() { empty.acquire(); buf_mtx.lock(); ++buffer_count; buf_mtx.unlock(); full.release(); }',
      'void consumer() { full.acquire();  buf_mtx.lock(); --buffer_count; buf_mtx.unlock(); empty.release(); }'
    ]
  },
  deadlock_free_hierarchy: {
    file: 'main.cpp',
    lines: [
      '#include <mutex>',
      'std::mutex mtx_A, mtx_B; // order: A < B',
      '',
      'void thread_1() { mtx_A.lock(); mtx_B.lock(); }',
      'void thread_2() { mtx_A.lock(); mtx_B.lock(); } // cycle broken'
    ]
  },
  dining_philosophers_deadlock: {
    file: 'main.cpp',
    lines: [
      '#include <mutex>',
      'std::mutex fork_mtx[3];',
      '',
      'void philosopher(int i) {',
      '  fork_mtx[i].lock();           // left fork',
      '  fork_mtx[(i + 1) % 3].lock(); // right fork -> cycle!',
      '}'
    ]
  },
  dining_philosophers_safe: {
    file: 'main.cpp',
    lines: [
      '#include <mutex>',
      'std::mutex fork_mtx[3];',
      '',
      'void philosopher(int i) {',
      '  int first = std::min(i, (i + 1) % 3);',
      '  int second = std::max(i, (i + 1) % 3);',
      '  fork_mtx[first].lock(); fork_mtx[second].lock(); // acyclic order',
      '}'
    ]
  }
};

export const Workspace: React.FC = () => {
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
    seek,
    reset,
    setSpeed,
    setSchedulerConfig,
    reRunNativeEngine,
    isLoading,
    activeView,
    setActiveView,
    getCurrentSnapshot,
    getCurrentEvent
  } = useSimulationStore();

  const [stageMode, setStageMode] = useState<StageMode>('blueprint');
  const [codeTab, setCodeTab] = useState<'source' | 'disassembly'>('source');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);

  const snapshot = getCurrentSnapshot();
  const currentEvent = getCurrentEvent();
  const scenario = scenarios.find((s) => s.id === currentScenarioId);
  const events = currentRun?.events || [];
  const totalSteps = currentRun?.snapshots?.length ? currentRun.snapshots.length - 1 : 0;

  const isDeadlocked = !!(snapshot?.deadlockReport?.isDeadlocked || currentEvent?.deadlockDetected);
  const isRaceDetected = !!(currentEvent?.raceDetected || (currentStep >= totalSteps && events.some((e) => e.raceDetected)));
  const isFinished = currentStep >= totalSteps && totalSteps > 0;

  // Keep stageMode aligned when user explicitly clicks a special module category if needed
  const handleSelectSidebarConcept = (scenarioId: string, preferredMode: StageMode = 'blueprint') => {
    loadScenario(scenarioId);
    setStageMode(preferredMode);
  };

  // Autoplay loop timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(180, Math.floor(900 / speed));
    const timer = setInterval(() => {
      const state = useSimulationStore.getState();
      const maxSteps = state.currentRun?.snapshots?.length ? state.currentRun.snapshots.length - 1 : 0;
      if (state.currentStep < maxSteps) {
        state.stepForward();
      } else {
        state.pause();
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBackward, reset]);

  const threads = snapshot?.threads ? Object.values(snapshot.threads) : [];
  const sharedVars = snapshot?.sharedVariables ? Object.entries(snapshot.sharedVariables) : [];
  const primaryVar = sharedVars[0];
  const primaryVarName = primaryVar ? primaryVar[0] : 'counter';
  const primaryVarValue = primaryVar ? primaryVar[1].value : 0;

  // Determine truthful Expected vs Actual comparison metrics from C++ engine state
  const getBarComparison = () => {
    if (currentScenarioId === 'race_counter_2' || currentScenarioId === 'mutex_counter_2') {
      return { expectedLabel: 'Expected', expected: 2, actualLabel: 'Actual', actual: primaryVarValue, max: 2 };
    }
    if (currentScenarioId === 'race_counter_3' || currentScenarioId === 'mutex_contention') {
      return { expectedLabel: 'Expected', expected: 3, actualLabel: 'Actual', actual: primaryVarValue, max: 3 };
    }
    if (currentScenarioId === 'producer_consumer_3') {
      const cap = snapshot?.sharedVariables?.capacity?.value ?? 3;
      const count = snapshot?.sharedVariables?.buffer_count?.value ?? 0;
      return { expectedLabel: 'Capacity', expected: cap, actualLabel: 'Buffered', actual: count, max: Math.max(3, cap) };
    }
    if (currentScenarioId === 'counting_semaphore') {
      const sem = snapshot?.semaphores ? Object.values(snapshot.semaphores)[0] : undefined;
      const initial = sem?.initialCount ?? 2;
      const avail = sem?.currentCount ?? initial;
      return { expectedLabel: 'Initial', expected: initial, actualLabel: 'Available', actual: avail, max: Math.max(2, initial) };
    }
    if (currentScenarioId.includes('deadlock')) {
      const totalThreads = Math.max(1, threads.length);
      const blockedCount = threads.filter((t) => t.state === 'BLOCKED').length;
      return { expectedLabel: 'Threads', expected: totalThreads, actualLabel: 'Blocked', actual: blockedCount, max: totalThreads };
    }
    return { expectedLabel: 'Target', expected: Math.max(2, primaryVarValue), actualLabel: 'Actual', actual: primaryVarValue, max: Math.max(2, primaryVarValue) };
  };

  const barStats = getBarComparison();

  const sourceBlock = SCENARIO_CPP_SOURCE[currentScenarioId] || {
    file: 'main.cpp',
    lines: [
      `// Scenario: ${scenario?.title || currentScenarioId}`,
      `// Scheduler: ${scheduler.toUpperCase()} (q=${quantum})`,
      '',
      ...threads.map((t) => `// Thread #${t.id}: ${t.name} [${t.state}] pc=${t.pc}`),
      '',
      ...events.slice(0, 6).map((ev) => `${ev.threadName}: ${ev.instruction.disassembly};`)
    ]
  };

  const handleCopyCode = () => {
    const text =
      codeTab === 'source'
        ? sourceBlock.lines.join('\n')
        : events.map((ev) => `#${ev.sequence} [${ev.threadName}] ${ev.instruction.disassembly}`).join('\n');
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1400);
  };

  const sidebarItems = [
    { id: '01', label: 'Race Conditions', scenarioId: 'race_counter_2' },
    { id: '02', label: 'Thread Scheduling', scenarioId: 'race_counter_3' },
    { id: '03', label: 'Mutual Exclusion', scenarioId: 'mutex_counter_2' },
    { id: '04', label: 'Deadlocks', scenarioId: 'deadlock_circular_wait' }
  ];

  // Live observation text strictly from C++ engine diagnostics
  const observationText =
    currentEvent?.raceDetails?.explanation ||
    (isDeadlocked ? snapshot?.deadlockReport?.explanation : undefined) ||
    currentEvent?.explanation ||
    scenario?.keyTakeaway ||
    'Step through or run the simulation to inspect instruction-level interleaving.';

  // Executed events log up to currentStep
  const visibleOutputEvents = currentStep > 0 ? events.slice(Math.max(0, currentStep - 3), currentStep) : [];

  return (
    <div className="w-full max-w-[1440px] mx-auto flex-1 bg-[#F6F4EF] text-[#141413] grid grid-cols-1 lg:grid-cols-[245px_1fr_300px] min-h-[calc(100vh-57px)] border-x border-[#141413]/10">
      {/* ==================== 1. LEFT SIDEBAR (WORKSPACE / LAB SETTINGS / RESOURCES) ==================== */}
      <aside className="border-b lg:border-b-0 lg:border-r border-[#141413]/20 bg-[#F6F4EF] p-4 sm:p-5 space-y-6 select-none">
        {/* — WORKSPACE */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#595751] uppercase font-semibold">
            <span className="w-3.5 h-[1.5px] bg-[#9E381E]" />
            <span>WORKSPACE</span>
          </div>

          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive =
                currentScenarioId === item.scenarioId ||
                (item.id === '01' && currentScenarioId.startsWith('race_') && currentScenarioId !== 'race_counter_3') ||
                (item.id === '03' && currentScenarioId.startsWith('mutex_')) ||
                (item.id === '04' && (currentScenarioId.includes('deadlock') || currentScenarioId.includes('dining')));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSidebarConcept(item.scenarioId, 'blueprint')}
                  className={`w-full px-2.5 py-2 text-left font-mono text-[11.5px] flex items-center justify-between transition-colors cursor-pointer rounded-[4px] ${
                    isActive
                      ? 'bg-[#F5EBE4] text-[#141413] font-semibold border border-[#9E381E]/25'
                      : 'text-[#595751] hover:text-[#141413] hover:bg-[#ECEAE3]'
                  }`}
                >
                  <span>
                    <span className="text-[#8C8982] mr-1.5">[{item.id}]</span>
                    {item.label}
                  </span>
                  {isActive && <ArrowRight className="w-3.5 h-3.5 text-[#141413]" />}
                </button>
              );
            })}
          </div>

          {/* All 10 Native C++ Scenarios Selector */}
          <div className="pt-1.5">
            <label className="block font-mono text-[9.5px] text-[#8C8982] uppercase tracking-wider mb-1">
              ALL_SCENARIOS [10]
            </label>
            <select
              value={currentScenarioId}
              onChange={(e) => {
                const val = e.target.value;
                loadScenario(val);
                if (val.includes('dining')) setStageMode('philosophers');
                else if (val.includes('producer')) setStageMode('buffer');
                else setStageMode('blueprint');
              }}
              className="w-full bg-white border border-[#141413]/25 text-[#141413] font-mono text-[11px] px-2 py-1.5 rounded-[4px] focus:outline-none focus:border-[#141413] cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* — LAB SETTINGS */}
        <div className="space-y-2.5 pt-2 border-t border-[#141413]/15">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#595751] uppercase font-semibold">
            <span className="w-3.5 h-[1.5px] bg-[#9E381E]" />
            <span>LAB SETTINGS</span>
          </div>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#595751]">Thread Count</span>
              <span className="w-16 px-2 py-1 bg-white border border-[#141413]/25 rounded-[4px] text-center font-semibold text-[#141413]">
                {threads.length}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[#595751]">Quantum (inst)</span>
              <input
                type="number"
                min={1}
                max={8}
                value={quantum}
                onChange={(e) => setSchedulerConfig(scheduler, Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
                className="w-16 px-2 py-1 bg-white border border-[#141413]/25 rounded-[4px] text-center font-semibold text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[#595751]">Total Steps</span>
              <span className="w-16 px-2 py-1 bg-white border border-[#141413]/25 rounded-[4px] text-center font-semibold text-[#141413]">
                {totalSteps}
              </span>
            </div>
          </div>
        </div>

        {/* — RESOURCES & VIEWS */}
        <div className="space-y-2.5 pt-2 border-t border-[#141413]/15">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#595751] uppercase font-semibold">
            <span className="w-3.5 h-[1.5px] bg-[#9E381E]" />
            <span>VISUALIZERS</span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            {(
              [
                { id: 'blueprint', label: 'Schematic Stage' },
                { id: 'lanes', label: 'Thread Lanes' },
                { id: 'memory', label: 'Shared Memory' },
                { id: 'rag', label: 'RAG / Deadlock' },
                { id: 'buffer', label: 'Bounded Buffer' },
                { id: 'philosophers', label: 'Dining Table' }
              ] as const
            ).map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setStageMode(v.id);
                  if (v.id !== 'blueprint') setActiveView(v.id);
                }}
                className={`w-full px-2 py-1.5 flex items-center justify-between rounded-[4px] transition-colors cursor-pointer ${
                  stageMode === v.id
                    ? 'bg-[#141413] text-[#F6F4EF] font-semibold'
                    : 'text-[#595751] hover:text-[#141413] hover:bg-[#ECEAE3]'
                }`}
              >
                <span>{v.label}</span>
                <ExternalLink className="w-3 h-3 opacity-75" />
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* ==================== 2. CENTER WORKBENCH (HEADER + STAGE + CODE + RUN CONFIG) ==================== */}
      <main className="flex flex-col min-w-0 p-4 sm:p-6 space-y-4 bg-[#F6F4EF]">
        {/* Top Scenario Title & Status Pill */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.12em] text-[#9E381E] uppercase font-semibold">
              <span className="w-4 h-[1.5px] bg-[#9E381E]" />
              <span>{scenario?.moduleTitle || 'CONCURRENCY_LAB'}</span>
            </div>
            <h1 className="font-grotesk font-semibold text-2xl sm:text-[28px] leading-tight tracking-tight text-[#141413]">
              {scenario?.title || 'Race Conditions'}
            </h1>
            <p className="font-mono text-[11.5px] text-[#595751]">
              {scenario?.description || 'Observe how unsynchronized thread interleaving corrupts shared state.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isRaceDetected && (
              <button
                type="button"
                onClick={() => setIsRaceModalOpen(true)}
                className="px-2.5 py-1 rounded-full bg-[#F7ECE6] border border-[#9E381E]/40 text-[#9E381E] font-mono text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#F3E2D8]"
              >
                <Zap className="w-3 h-3" />
                <span>Inspect Race</span>
              </button>
            )}

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[11px] font-medium ${
                isDeadlocked
                  ? 'bg-[#FEE2E2] border-[#DC2626]/40 text-[#991B1B]'
                  : isRaceDetected
                  ? 'bg-[#FEF3C7] border-[#D97706]/40 text-[#92400E]'
                  : isPlaying
                  ? 'bg-[#141413] border-[#141413] text-[#F6F4EF]'
                  : 'bg-[#EAF4ED] border-[#047857]/30 text-[#047857]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isDeadlocked
                    ? 'bg-[#DC2626]'
                    : isRaceDetected
                    ? 'bg-[#D97706]'
                    : isPlaying
                    ? 'bg-[#34D399] animate-ping'
                    : 'bg-[#10B981]'
                }`}
              />
              <span>
                {isDeadlocked
                  ? 'Deadlock Detected'
                  : isRaceDetected
                  ? 'Race Conflict'
                  : isPlaying
                  ? 'Executing'
                  : isFinished
                  ? 'Completed'
                  : 'Ready to Run'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Isometric Stage OR Selected Classic Visualizer */}
        <div className="w-full min-w-0 flex flex-col justify-center">
          {stageMode === 'blueprint' ? (
            <WorkspaceBlueprintStage
              scenarioId={currentScenarioId}
              snapshot={snapshot}
              currentEvent={currentEvent}
              currentStep={currentStep}
              totalSteps={totalSteps}
              quantum={quantum}
              scheduler={scheduler}
            />
          ) : (
            <div className="border border-[#141413]/20 bg-[#FAF9F5] p-3 overflow-x-auto">
              {activeView === 'lanes' && <ThreadLanes onOpenRaceModal={() => setIsRaceModalOpen(true)} />}
              {activeView === 'memory' && <SharedMemoryView />}
              {activeView === 'rag' && <ResourceAllocationGraph />}
              {activeView === 'philosophers' && <DiningTable />}
              {activeView === 'buffer' && <BoundedBuffer />}
            </div>
          )}
        </div>

        {/* Bottom Two Cards: Code/Disassembly Viewer + Run Configuration */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4 items-stretch pt-1">
          {/* Code / Disassembly Card */}
          <div className="flex flex-col min-w-0">
            {/* Folder-style File Tabs */}
            <div className="flex items-end justify-between">
              <div className="flex items-center font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setCodeTab('source')}
                  className={`px-3.5 py-1.5 border border-b-0 rounded-t-[6px] cursor-pointer transition-colors ${
                    codeTab === 'source'
                      ? 'bg-[#141413] text-[#F6F4EF] border-[#141413] font-semibold'
                      : 'bg-[#FAF9F5] text-[#595751] border-[#141413]/25 hover:text-[#141413]'
                  }`}
                >
                  {sourceBlock.file}
                </button>
                <button
                  type="button"
                  onClick={() => setCodeTab('disassembly')}
                  className={`px-3.5 py-1.5 border border-b-0 border-l-0 rounded-t-[6px] cursor-pointer transition-colors ${
                    codeTab === 'disassembly'
                      ? 'bg-[#141413] text-[#F6F4EF] border-[#141413] font-semibold'
                      : 'bg-[#FAF9F5] text-[#595751] border-[#141413]/25 hover:text-[#141413]'
                  }`}
                >
                  trace.asm
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 bg-white border border-[#141413]/25 rounded-b-[6px] rounded-tr-[6px] p-3.5 font-mono text-[11.5px] relative overflow-x-auto min-h-[210px]">
              <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Copy listing"
                  className="p-1 text-[#595751] hover:text-[#141413] cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {codeTab === 'source' ? (
                <div className="space-y-0.5 pr-8">
                  {sourceBlock.lines.map((line, i) => {
                    const isInclude = line.trim().startsWith('#include');
                    const commentIdx = line.indexOf('//');
                    const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
                    const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

                    return (
                      <div key={i} className="flex items-start gap-3 leading-[1.6]">
                        <span className="w-5 text-right text-[#8C8982] select-none flex-shrink-0">{i + 1}</span>
                        <span className="whitespace-pre">
                          {isInclude ? (
                            <span className="text-[#9E381E]">{codePart}</span>
                          ) : (
                            <span className="text-[#141413]">{codePart}</span>
                          )}
                          {commentPart && <span className="text-[#047857]">{commentPart}</span>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1 pr-6 max-h-[195px] overflow-y-auto scrollbar-thin">
                  {events.map((ev) => {
                    const isSelected = ev.sequence === currentStep;
                    return (
                      <button
                        key={ev.sequence}
                        type="button"
                        onClick={() => seek(ev.sequence)}
                        className={`w-full text-left px-2 py-1 flex items-center justify-between gap-2 rounded-[3px] cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#141413] text-[#F6F4EF] font-semibold'
                            : 'hover:bg-[#FAF9F5] text-[#141413]'
                        }`}
                      >
                        <span className="truncate">
                          <span className={isSelected ? 'text-amber-300 mr-2' : 'text-[#8C8982] mr-2'}>
                            #{ev.sequence}
                          </span>
                          <span className="font-semibold mr-1.5">[{ev.threadName}]</span>
                          <span>{ev.instruction.disassembly}</span>
                        </span>
                        <span className={`text-[9.5px] flex-shrink-0 ${isSelected ? 'text-amber-300' : 'text-[#8C8982]'}`}>
                          PC:{ev.previousPc}→{ev.newPc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Run Configuration Card */}
          <div className="bg-white border border-[#141413]/25 rounded-[6px] p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#595751] uppercase font-semibold">
                <span className="w-3.5 h-[1.5px] bg-[#9E381E]" />
                <span>RUN CONFIGURATION</span>
              </div>

              <div className="space-y-2 font-mono text-[11.5px]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#595751]">Scheduler</span>
                  <select
                    value={scheduler}
                    onChange={(e) => setSchedulerConfig(e.target.value)}
                    className="w-32 px-2 py-1 bg-[#FAF9F5] border border-[#141413]/25 rounded-[4px] text-[#141413] font-semibold text-[11px] focus:outline-none focus:border-[#141413] cursor-pointer"
                  >
                    <option value="rr">Round Robin</option>
                    <option value="fifo">FIFO</option>
                    <option value="random">Seeded Random</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#595751]">Timeline Step</span>
                  <div className="flex items-center bg-[#FAF9F5] border border-[#141413]/25 rounded-[4px]">
                    <button
                      type="button"
                      onClick={stepBackward}
                      disabled={currentStep === 0}
                      className="px-1.5 py-1 text-[#141413] disabled:opacity-30 hover:bg-[#ECEAE3] cursor-pointer"
                      aria-label="Previous step"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-2 font-semibold text-[#141413] min-w-[48px] text-center">
                      {currentStep}/{totalSteps}
                    </span>
                    <button
                      type="button"
                      onClick={stepForward}
                      disabled={isFinished}
                      className="px-1.5 py-1 text-[#141413] disabled:opacity-30 hover:bg-[#ECEAE3] cursor-pointer"
                      aria-label="Next step"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#595751]">Playback Speed</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 4].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSpeed(s)}
                        className={`px-2 py-0.5 border rounded-[3px] text-[10px] font-semibold cursor-pointer ${
                          speed === s
                            ? 'bg-[#141413] text-[#F6F4EF] border-[#141413]'
                            : 'bg-[#FAF9F5] text-[#595751] border-[#141413]/20 hover:text-[#141413]'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Run Experiment + Reset */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#141413]/10">
              <button
                type="button"
                onClick={isPlaying ? pause : play}
                className="flex-1 py-2 px-3 rounded-[5px] bg-[#141413] hover:bg-[#27272A] text-[#F6F4EF] font-mono text-[11.5px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Run Experiment'}</span>
              </button>

              <button
                type="button"
                onClick={reset}
                className="px-3 py-2 rounded-[5px] border border-[#141413]/35 bg-white hover:bg-[#FAF9F5] text-[#141413] font-mono text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={() => reRunNativeEngine()}
                disabled={isLoading}
                title="Re-run C++20 native engine"
                className="p-2 rounded-[5px] border border-[#141413]/25 bg-[#FAF9F5] hover:bg-white text-[#141413] cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ==================== 3. RIGHT SIDEBAR (EXECUTION OUTPUT / RESULT VISUALIZATION / OBSERVATION) ==================== */}
      <aside className="border-t lg:border-t-0 lg:border-l border-[#141413]/20 bg-[#F6F4EF] p-4 sm:p-5 space-y-5">
        {/* — EXECUTION OUTPUT */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#595751] uppercase font-semibold">
            <span className="w-3.5 h-[1.5px] bg-[#9E381E]" />
            <span>EXECUTION OUTPUT</span>
          </div>

          <div className="bg-white border border-[#141413]/25 rounded-[6px] p-3.5 font-mono text-[11px] space-y-2">
            <div className="space-y-1 text-[#141413]">
              <div className="text-[#595751]">&gt; Running {currentScenarioId} ({scheduler}, q={quantum}) ...</div>

              {currentStep === 0 ? (
                <div className="text-[#595751]">[0/{totalSteps}] Engine ready. Press Run or Step.</div>
              ) : (
                visibleOutputEvents.map((ev) => (
                  <div key={ev.sequence} className="truncate">
                    <span className="text-[#8C8982] mr-1">[{ev.threadName}]</span>
                    <span>{ev.instruction.disassembly}</span>
                  </div>
                ))
              )}

              <div className="flex items-center gap-1.5 text-[#047857] font-medium pt-0.5">
                <Check className="w-3 h-3" />
                <span>
                  Step {currentStep}/{totalSteps} {isFinished ? '(Completed)' : ''}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-[#141413]/20 flex items-center justify-between font-grotesk font-semibold text-xs text-[#141413]">
              <span>Current {primaryVarName}:</span>
              <span className="px-2 py-0.5 rounded-[3px] bg-[#F5EBE4] text-[#9E381E] font-mono font-bold">
                {primaryVarValue}
              </span>
            </div>
          </div>
        </div>

        {/* — RESULT VISUALIZATION */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-[#595751] uppercase font-semibold">
            <span className="w-3.5 h-[1.5px] bg-[#9E381E]" />
            <span>RESULT VISUALIZATION</span>
          </div>

          <div className="bg-white border border-[#141413]/25 rounded-[6px] p-3.5">
            <svg viewBox="0 0 230 135" className="w-full h-auto block select-none">
              <defs>
                <pattern id="bar-hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#9E381E" strokeWidth="1" opacity="0.25" />
                </pattern>
              </defs>

              {/* Horizontal Grid Lines + Y-Axis Ticks */}
              {[0, 0.5, 1].map((frac, idx) => {
                const y = 96 - frac * 76;
                const val = Math.round(barStats.max * frac * 10) / 10;
                return (
                  <g key={idx}>
                    <line x1="36" y1={y} x2="215" y2={y} stroke="#E4E1D9" strokeWidth="1" />
                    <text x="30" y={y + 3} textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#595751">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Expected Bar (Solid Terracotta) */}
              {(() => {
                const hExp = Math.max(4, (barStats.expected / Math.max(1, barStats.max)) * 76);
                return (
                  <g>
                    <rect
                      x="64"
                      y={96 - hExp}
                      width="44"
                      height={hExp}
                      rx="3"
                      fill="#A94122"
                    />
                    <text x="86" y="114" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#141413">
                      {barStats.expectedLabel}
                    </text>
                  </g>
                );
              })()}

              {/* Actual Bar (Hatched Blush Outline) */}
              {(() => {
                const hAct = Math.max(4, (barStats.actual / Math.max(1, barStats.max)) * 76);
                return (
                  <g>
                    <rect
                      x="136"
                      y={96 - hAct}
                      width="44"
                      height={hAct}
                      rx="3"
                      fill="#F7ECE6"
                    />
                    <rect
                      x="136"
                      y={96 - hAct}
                      width="44"
                      height={hAct}
                      rx="3"
                      fill="url(#bar-hatch)"
                      stroke="#A94122"
                      strokeWidth="1.2"
                    />
                    <text x="158" y="114" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="#141413">
                      {barStats.actualLabel}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* — OBSERVATION */}
        <div className="bg-[#F7ECE6] border border-[#9E381E]/30 rounded-[6px] p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 font-grotesk font-semibold text-xs text-[#141413]">
            <Info className="w-3.5 h-3.5 text-[#141413]" />
            <span>Observation</span>
          </div>
          <p className="font-mono text-[11px] leading-relaxed text-[#595751]">
            {observationText}
          </p>
        </div>
      </aside>

      {/* Race Analysis Diagnostic Modal */}
      <RaceAnalysisModal
        isOpen={isRaceModalOpen}
        onClose={() => setIsRaceModalOpen(false)}
      />
    </div>
  );
};
