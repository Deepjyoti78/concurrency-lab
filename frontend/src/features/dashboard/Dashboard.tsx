import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { InteractiveTraceHero } from './InteractiveTraceHero';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface DashboardProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenWorkspace }) => {
  const { loadScenario, isBackendConnected } = useSimulationStore();

  const handleLaunch = (scenarioId: string) => {
    loadScenario(scenarioId);
    onOpenWorkspace(scenarioId);
  };

  const scrollToLabs = () => {
    const el = document.getElementById('simulation-labs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const modules = [
    {
      id: 'race-conditions',
      scenarioId: 'race_counter_2',
      category: 'Data Race',
      difficulty: 'Beginner',
      title: 'Race conditions',
      description: "Find the instruction that overwrites the first thread's increment without synchronization.",
      steps: '6 steps',
      outcome: 'Expected: counter=2 • Actual: counter=1 (Lost Update)'
    },
    {
      id: 'mutex',
      scenarioId: 'mutex_counter_2',
      category: 'Mutual Exclusion',
      difficulty: 'Beginner',
      title: 'Mutual exclusion',
      description: 'See how a mutex lock serializes critical sections and lets both increments reach memory safely.',
      steps: '8 steps',
      outcome: 'Critical section isolated • Expected: counter=2 (Correct)'
    },
    {
      id: 'deadlocks',
      scenarioId: 'deadlock_circular_wait',
      category: 'Deadlock',
      difficulty: 'Intermediate',
      title: 'Deadlocks',
      description: "Follow two threads acquiring locks in reverse order until each freezes waiting for the other.",
      steps: '4 steps',
      outcome: 'Circular wait detected • 2-thread mutual dependency cycle'
    },
    {
      id: 'semaphores',
      scenarioId: 'counting_semaphore',
      category: 'Semaphores',
      difficulty: 'Intermediate',
      title: 'Semaphores',
      description: 'Regulate concurrent access to a shared resource pool constrained to capacity 2.',
      steps: '8 steps',
      outcome: 'Pool regulation • Threads 3 & 4 queued in FIFO wait list'
    },
    {
      id: 'producer-consumer',
      scenarioId: 'producer_consumer_3',
      category: 'Coordination',
      difficulty: 'Advanced',
      title: 'Producer-Consumer',
      description: 'Coordinate producer and consumer threads through a 3-slot bounded buffer using dual semaphores.',
      steps: '32 steps',
      outcome: 'Safety invariant: 0 ≤ buffer_count ≤ 3 maintained'
    },
    {
      id: 'dining-philosophers',
      scenarioId: 'dining_philosophers_deadlock',
      category: 'Classical Anomaly',
      difficulty: 'Advanced',
      title: 'Dining Philosophers',
      description: 'Observe 5 philosophers pick up their left fork simultaneously and freeze in symmetric circular wait.',
      steps: '15 steps',
      outcome: '5-way circular wait deadlock on shared fork resources'
    }
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-12 sm:space-y-16 bg-[#FBF4EA] text-[#18181B] overflow-x-hidden select-none">
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start pt-2">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-7 pr-0 lg:pr-4">
          {/* Micro-label */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.16em] uppercase text-[#44403C]">
            <span className="w-5 h-[1.5px] bg-[#9E381E] inline-block" />
            <span>INTERACTIVE COMPUTER SCIENCE LABORATORY</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.04] tracking-tight text-[#18181B]">
            Multithreading,<br />
            <span className="font-editorial-italic font-normal text-[#9E381E]">one step at a time.</span>
          </h1>

          {/* Subheading */}
          <p className="text-[#57534E] text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal">
            Step through two threads, inspect shared state, and see where a race condition or deadlock begins. ConcurrencyLab connects a native compiled C++20 simulation core directly to an interactive instruction-level workstation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={() => handleLaunch('race_counter_2')}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-[#9E381E] hover:bg-[#862E17] text-white font-semibold text-xs sm:text-sm tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Start the two-thread race</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={scrollToLabs}
              className="text-[#18181B] hover:text-[#9E381E] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer py-2"
            >
              <span>Browse labs</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Editorial Capabilities Strip */}
          <div className="pt-2 border-t border-[#DDD6CB] grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-[#57534E]">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#9E381E]" />
              <span>C++20 Engine Truth</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#18181B]" />
              <span>Deterministic Replay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#6366F1]" />
              <span>RAG Cycle Oracles</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#10B981]" />
              <span>10 Classic Labs</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Trace Card */}
        <div className="lg:col-span-5 flex justify-center w-full min-w-0">
          <InteractiveTraceHero onOpenWorkspace={onOpenWorkspace} />
        </div>
      </section>

      {/* 2. Engineering Metrics & Architectural Invariants Strip */}
      <section className="border-y border-[#DDD6CB] bg-[#F4EFE7]/60 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-5 sm:py-6">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 divide-x-0 md:divide-x divide-[#DDD6CB]">
          {/* Spec 1 */}
          <div className="space-y-1 md:pr-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
              Engine Architecture
            </div>
            <div className="text-xl sm:text-2xl font-editorial font-bold text-[#18181B]">
              Native C++20 Core
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Real-time instruction dispatcher, virtual thread state machine, and atomic memory bus.
            </p>
          </div>

          {/* Spec 2 */}
          <div className="space-y-1 md:px-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
              Replay Fidelity
            </div>
            <div className="text-xl sm:text-2xl font-editorial font-bold text-[#18181B]">
              0 ms Time-Travel
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Every clock tick produces an immutable state snapshot. Scrub backwards or forwards with zero drift.
            </p>
          </div>

          {/* Spec 3 */}
          <div className="space-y-1 md:px-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
              Formal Verification
            </div>
            <div className="text-xl sm:text-2xl font-editorial font-bold text-[#18181B]">
              Tarjan's DFS Cycle
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              Resource Allocation Graph (RAG) algorithmically proves Coffman's 4th deadlock condition.
            </p>
          </div>

          {/* Spec 4 */}
          <div className="space-y-1 md:pl-6">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#78716C]">
              Laboratory Corpus
            </div>
            <div className="text-xl sm:text-2xl font-editorial font-bold text-[#18181B]">
              6 Modules • 10 Scenarios
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              From two-thread races to asymmetric dining philosophers and bounded buffers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Simulation Labs Section */}
      <section id="simulation-labs" className="space-y-6 pt-2 scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#9E381E] font-semibold mb-1">
              Curated Experiment Corpus
            </div>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-[42px] font-normal text-[#18181B] tracking-tight">
              Simulation labs
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-normal">
              Choose a trace to open in the interactive laboratory workspace.
            </p>
          </div>

          <button
            onClick={() => onOpenWorkspace()}
            className="text-xs sm:text-sm font-semibold text-[#18181B] hover:text-[#9E381E] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto py-1"
          >
            <span>Open workspace</span>
            <span className="font-mono">→</span>
          </button>
        </div>

        {/* Broadsheet / Editorial Hairline Grid with Sharp Cards */}
        <div className="border-t-2 border-[#18181B] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, idx) => {
            const isRightBorder = (idx + 1) % 3 !== 0;

            return (
              <div
                key={m.id}
                onClick={() => handleLaunch(m.scenarioId)}
                className={`p-6 sm:p-7 border-b border-[#DDD6CB] ${
                  isRightBorder ? 'lg:border-r border-[#DDD6CB]' : ''
                } ${
                  (idx + 1) % 2 !== 0 ? 'md:border-r lg:border-r-0' : ''
                } ${
                  isRightBorder ? 'lg:border-r border-[#DDD6CB]' : ''
                } bg-[#FBF4EA] hover:bg-[#F4EFE7] transition-all cursor-pointer group flex flex-col justify-between min-h-[220px]`}
              >
                {/* Top Row: Meta Badges & Title */}
                <div>
                  <div className="flex items-center justify-between pb-2 text-[10px] font-mono text-[#78716C]">
                    <span className="uppercase tracking-wider font-semibold text-[#9E381E]">
                      {m.category}
                    </span>
                    <span className="px-1.5 py-0.2 bg-[#EFEAE2] border border-[#DDD6CB] text-[#57534E]">
                      {m.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2">
                    <h3 className="font-editorial text-xl sm:text-2xl text-[#18181B] group-hover:text-black transition-colors font-medium">
                      {m.title}
                    </h3>
                    <span className="text-[#78716C] group-hover:text-[#9E381E] group-hover:translate-x-1 transition-all text-sm font-mono">
                      →
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
                    {m.description}
                  </p>
                </div>

                {/* Bottom Row: Steps Count & Concrete Outcome */}
                <div className="pt-4 mt-3 border-t border-[#E6E0D6] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#9E381E] font-bold">
                      {m.steps}
                    </span>
                    <span className="text-[#78716C] group-hover:text-[#18181B] font-semibold text-[10px]">
                      Launch Experiment ↗
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-[#78716C] truncate" title={m.outcome}>
                    {m.outcome}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Inside the Simulation Core (Editorial Architectural Deep Dive) */}
      <section className="space-y-6 pt-4">
        <div className="pb-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#9E381E] font-semibold mb-1">
            System Mechanics
          </div>
          <h2 className="font-editorial text-3xl sm:text-4xl text-[#18181B] tracking-tight">
            How ConcurrencyLab Works
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1 max-w-2xl font-normal">
            Unlike abstract web animations, ConcurrencyLab models execution at the machine instruction layer. High-level language statements are decomposed into atomic CPU operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 border border-[#DDD6CB] bg-[#F4EFE7] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
                01
              </div>
              <h3 className="font-editorial text-xl font-medium text-[#18181B]">
                Instruction Disassembly
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Operations such as <code className="bg-[#EFEAE2] px-1 py-0.5 text-[#18181B]">counter++</code> are expanded into discrete <code className="text-[#9E381E]">READ_SHARED</code>, <code className="text-[#9E381E]">ADD_IMM</code>, and <code className="text-[#9E381E]">WRITE_SHARED</code> virtual assembly opcodes.
              </p>
            </div>
            <div className="pt-3 border-t border-[#DDD6CB] font-mono text-[10px] text-[#78716C]">
              Thread-local registers (r0, r1, PC) isolated
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 border border-[#DDD6CB] bg-[#F4EFE7] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
                02
              </div>
              <h3 className="font-editorial text-xl font-medium text-[#18181B]">
                Tarjan's DFS Cycle Detection
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Every lock acquisition and blocking transition updates a directed bipartite graph. When mutual circular dependencies form, the engine mathematically proves deadlock.
              </p>
            </div>
            <div className="pt-3 border-t border-[#DDD6CB] font-mono text-[10px] text-[#78716C]">
              Resource Allocation Graph & Wait-For Graph
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 border border-[#DDD6CB] bg-[#F4EFE7] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-[#18181B] text-white flex items-center justify-center font-mono text-xs font-bold">
                03
              </div>
              <h3 className="font-editorial text-xl font-medium text-[#18181B]">
                Snapshot Time-Travel
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Rather than re-executing non-deterministic threads, the engine records an immutable state snapshot at each step. Scrub forward and backward freely without simulation drift.
              </p>
            </div>
            <div className="pt-3 border-t border-[#DDD6CB] font-mono text-[10px] text-[#78716C]">
              O(1) state restoration per simulation cycle
            </div>
          </div>
        </div>
      </section>

      {/* 5. Broadsheet Academic Footer */}
      <footer className="border-t-2 border-[#18181B] pt-8 pb-4 text-xs text-[#78716C] font-mono space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[#18181B]">
            <span className="font-bold tracking-tight text-sm font-sans">
              ConcurrencyLab
            </span>
            <span className="text-stone-400">•</span>
            <span className="text-[11px] text-[#57534E]">
              Operating Systems & Multithreading Laboratory
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#57534E]">
            <button
              onClick={() => onOpenWorkspace('race_counter_2')}
              className="hover:text-[#18181B] cursor-pointer"
            >
              Race Conditions
            </button>
            <button
              onClick={() => onOpenWorkspace('deadlock_circular_wait')}
              className="hover:text-[#18181B] cursor-pointer"
            >
              Deadlocks
            </button>
            <button
              onClick={() => onOpenWorkspace('dining_philosophers_deadlock')}
              className="hover:text-[#18181B] cursor-pointer"
            >
              Dining Table
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-[#A8A29E] pt-2 border-t border-[#E6E0D6]">
          <div>
            Built with C++20, Node.js IPC, and React 19. Designed for academic operating systems coursework.
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-[#57534E]">
              {isBackendConnected ? 'Native C++ IPC Active' : 'C++ Engine Cache Loaded'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
