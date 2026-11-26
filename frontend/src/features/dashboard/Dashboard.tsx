import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { HeroIsometricScene } from './HeroIsometricScene';
import { RaceConditionsThumbnail } from '../../components/illustrations/RaceConditionsThumbnail';
import { CpuCoreSocket } from '../../components/illustrations/CpuCoreSocket';
import { MutexPadlock } from '../../components/illustrations/MutexPadlock';
import { RagCycleThumbnail } from '../../components/illustrations/RagCycleThumbnail';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface DashboardProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenWorkspace }) => {
  const { loadScenario } = useSimulationStore();

  const handleLaunch = (scenarioId?: string) => {
    const sId = scenarioId || 'race_counter_2';
    loadScenario(sId);
    onOpenWorkspace(sId);
  };

  const scrollToLabs = () => {
    const el = document.getElementById('simulation-labs');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredExperiments = [
    {
      id: '01',
      code: 'RACE_COND',
      title: 'Race Conditions',
      scenarioId: 'race_counter_2',
      description: 'Observe how unsynchronized thread interleaving corrupts shared state.',
      illustration: <RaceConditionsThumbnail />
    },
    {
      id: '02',
      code: 'SCHED_RR',
      title: 'Thread Scheduling',
      scenarioId: 'race_counter_3',
      description: 'Inspect how CPU time-slices preempt and interleave concurrent workers.',
      illustration: <CpuCoreSocket />
    },
    {
      id: '03',
      code: 'MUTEX_CS',
      title: 'Mutual Exclusion',
      scenarioId: 'mutex_counter_2',
      description: 'Verify how lock guards serialize critical sections and preserve state.',
      illustration: <MutexPadlock />
    },
    {
      id: '04',
      code: 'DEADLOCK_RAG',
      title: 'Deadlocks',
      scenarioId: 'deadlock_circular_wait',
      description: 'Trace circular resource wait cycles and Tarjan SCC dependency traps.',
      illustration: <RagCycleThumbnail />
    }
  ];

  const fullModules = [
    {
      index: 'LAB_01',
      id: 'race-conditions',
      scenarioId: 'race_counter_2',
      category: 'DATA_RACE',
      difficulty: 'BEGINNER',
      title: 'Two-Thread Race',
      description: "Locate the instruction that overwrites the first thread's increment without synchronization.",
      steps: '06 STEPS',
      outcome: 'LOST_UPDATE: counter=1 (EXPECTED 2)'
    },
    {
      index: 'LAB_02',
      id: 'race-conditions-3',
      scenarioId: 'race_counter_3',
      category: 'DATA_RACE',
      difficulty: 'BEGINNER',
      title: 'Three-Thread Race',
      description: 'Three concurrent workers execute unsynchronized read-add-write sequences.',
      steps: '09 STEPS',
      outcome: 'MULTI_WRITE_COLLISION ACROSS 3 THREADS'
    },
    {
      index: 'LAB_03',
      id: 'mutex',
      scenarioId: 'mutex_counter_2',
      category: 'MUTUAL_EXCLUSION',
      difficulty: 'BEGINNER',
      title: 'Mutex Protection',
      description: 'Verify how a mutex lock serializes critical sections and protects shared increments.',
      steps: '10 STEPS',
      outcome: 'CS_ISOLATED: counter=2 (VERIFIED)'
    },
    {
      index: 'LAB_04',
      id: 'mutex-contention',
      scenarioId: 'mutex_contention',
      category: 'MUTUAL_EXCLUSION',
      difficulty: 'INTERMEDIATE',
      title: 'Lock Contention',
      description: 'Three worker threads compete for a single critical section with FIFO waiter queuing.',
      steps: '15 STEPS',
      outcome: 'FIFO_QUEUE PRESERVED // ZERO LEAKS'
    },
    {
      index: 'LAB_05',
      id: 'semaphores',
      scenarioId: 'counting_semaphore',
      category: 'SEMAPHORES',
      difficulty: 'INTERMEDIATE',
      title: 'Counting Semaphore',
      description: 'Regulate concurrent access to a shared resource pool constrained to capacity 2.',
      steps: '32 STEPS',
      outcome: 'POOL_CAP=2 // T3 & T4 QUEUED'
    },
    {
      index: 'LAB_06',
      id: 'producer-consumer',
      scenarioId: 'producer_consumer_3',
      category: 'COORDINATION',
      difficulty: 'ADVANCED',
      title: 'Producer-Consumer',
      description: 'Coordinate producer and consumer threads through a 3-slot bounded buffer via semaphores.',
      steps: '32 STEPS',
      outcome: 'INVARIANT: 0 ≤ buffer_count ≤ 3'
    },
    {
      index: 'LAB_07',
      id: 'deadlocks',
      scenarioId: 'deadlock_circular_wait',
      category: 'DEADLOCK',
      difficulty: 'INTERMEDIATE',
      title: 'Circular Wait Deadlock',
      description: 'Follow two threads acquiring locks in reverse order until both freeze on mutual dependencies.',
      steps: '04 STEPS',
      outcome: 'SCC_CYCLE DETECTED // FREEZE'
    },
    {
      index: 'LAB_08',
      id: 'deadlock-free',
      scenarioId: 'deadlock_free_hierarchy',
      category: 'DEADLOCK',
      difficulty: 'INTERMEDIATE',
      title: 'Lock Hierarchy',
      description: 'Observe how enforcing a global total ordering on lock acquisitions prevents circular wait.',
      steps: '10 STEPS',
      outcome: 'ZERO_CYCLES // CLEAN_TERMINATION'
    },
    {
      index: 'LAB_09',
      id: 'dining-philosophers-deadlock',
      scenarioId: 'dining_philosophers_deadlock',
      category: 'CLASSICAL_ANOMALY',
      difficulty: 'ADVANCED',
      title: 'Dining Philosophers Deadlock',
      description: 'Observe 5 philosophers acquire their left fork simultaneously and enter circular wait.',
      steps: '15 STEPS',
      outcome: '5-WAY CIRCULAR WAIT ON FORK MUTEXES'
    },
    {
      index: 'LAB_10',
      id: 'dining-philosophers-safe',
      scenarioId: 'dining_philosophers_safe',
      category: 'CLASSICAL_ANOMALY',
      difficulty: 'ADVANCED',
      title: 'Safe Dining Philosophers',
      description: 'Break symmetry by inverting acquisition order for even-indexed philosopher threads.',
      steps: '30 STEPS',
      outcome: 'DEADLOCK_FREE // ALL 5 TERMINATED'
    }
  ];

  return (
    <div className="w-full text-[#141413] overflow-x-hidden select-none">
      {/* 1. Hero Section (Exact Microscopic Blueprint Layout matching Image 1) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(330px,430px)_auto_1fr] gap-6 lg:gap-4 items-center">
          {/* Left Column: Micro Metadata, Grotesk/Serif Headline, Mono Description, Ink CTAs */}
          <div className="space-y-5 pr-0 lg:pr-2">
            {/* Micro Eyebrow Line: — INTERACTIVE CONCURRENCY LAB ——— EST. 2026 */}
            <div className="flex items-center gap-2.5 text-[10px] font-mono tracking-[0.12em] uppercase">
              <span className="w-5 h-[1.5px] bg-[#9E381E] flex-shrink-0" />
              <span className="text-[#141413] font-semibold whitespace-nowrap">INTERACTIVE CONCURRENCY LAB</span>
              <span className="flex-1 h-[1px] bg-[#141413]/25" />
              <span className="text-[#595751] whitespace-nowrap">EST. 2026</span>
            </div>

            {/* Headline: Concurrency, / made visible. */}
            <h1 className="font-grotesk font-semibold text-4xl sm:text-5xl lg:text-[52px] xl:text-[58px] leading-[1.03] tracking-[-0.03em] text-[#141413]">
              Concurrency,<br />
              <span className="font-editorial-italic font-normal text-[#9E381E] tracking-[-0.02em]">made visible.</span>
            </h1>

            {/* Crisp Monospace Technical Description */}
            <p className="font-mono text-[12px] sm:text-[13px] leading-[1.68] text-[#595751] max-w-[400px]">
              Explore real concurrency problems through interactive simulations. Run, trace, and understand how threads, shared state, and synchronization work in real programs.
            </p>

            {/* Primary Dark Ink CTA & Hairline Secondary CTA */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleLaunch('race_counter_2')}
                className="px-5 py-2.5 rounded-[5px] bg-[#141413] hover:bg-[#27272A] text-[#F6F4EF] font-mono font-medium text-xs tracking-wide transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span>Start the Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleLaunch('race_counter_2')}
                className="px-5 py-2.5 rounded-[5px] border border-[#141413]/75 bg-transparent hover:bg-[#141413]/5 text-[#141413] font-mono font-medium text-xs tracking-wide transition-colors flex items-center gap-2.5 cursor-pointer"
              >
                <span>Open Workspace</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Center Architectural Crosshair Reticle (+) */}
          <div className="hidden lg:flex items-center justify-center px-2" aria-hidden="true">
            <svg viewBox="0 0 28 28" className="w-7 h-7 text-[#141413]/65" fill="none" stroke="currentColor" strokeWidth="0.9">
              <line x1="14" y1="2" x2="14" y2="26" />
              <line x1="2" y1="14" x2="26" y2="14" />
            </svg>
          </div>

          {/* Right Column: Monochrome Technical Isometric Schematic */}
          <div className="flex justify-center w-full min-w-0">
            <HeroIsometricScene onOpenWorkspace={handleLaunch} />
          </div>
        </div>

        {/* Bottom Hero Telemetry Divider (Matching Image 1) */}
        <div className="mt-8 sm:mt-10 pt-2 flex items-center gap-3 text-[10px] font-mono tracking-[0.14em] text-[#141413] uppercase">
          <span className="w-1.5 h-1.5 rounded-full border border-[#141413] flex-shrink-0" />
          <span className="w-4 h-[1px] bg-[#141413]/45 flex-shrink-0" />
          <span className="font-semibold whitespace-nowrap">C++20</span>
          <span className="text-[#8C8982]">/</span>
          <span className="whitespace-nowrap">THREADS</span>
          <span className="text-[#8C8982]">/</span>
          <span className="whitespace-nowrap hidden sm:inline">SYNCHRONIZATION</span>
          <span className="text-[#8C8982] hidden sm:inline">/</span>
          <span className="whitespace-nowrap hidden md:inline">SHARED STATE</span>
          <span className="flex-1 h-[1px] bg-[#141413]/30" />
          <span className="tracking-[0.2em] text-[#595751] hidden sm:inline">////</span>
          <span className="w-4 h-[1px] bg-[#141413]/45 flex-shrink-0" />
          <span className="w-1.5 h-1.5 rounded-full border border-[#141413] flex-shrink-0" />
        </div>
      </section>

      {/* 2. Microscopic Telemetry Specifications Strip (Image 2 Inspired) */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-4">
        <div className="border border-[#141413]/25 bg-white/55 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#141413]/20">
          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#8C8982]">
              <span>NODE_01 // ENGINE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E381E]" />
            </div>
            <div className="font-grotesk font-semibold text-xs text-[#141413]">C++20 Engine Truth</div>
            <p className="font-mono text-[10.5px] text-[#595751] leading-relaxed">
              Instruction-level virtual thread dispatcher synced directly from native binary.
            </p>
          </div>

          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#8C8982]">
              <span>NODE_02 // TIME_TRAVEL</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#141413]" />
            </div>
            <div className="font-grotesk font-semibold text-xs text-[#141413]">Deterministic Replay</div>
            <p className="font-mono text-[10.5px] text-[#595751] leading-relaxed">
              Immutable snapshot log supporting forward, reverse, and seeded random runs.
            </p>
          </div>

          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#8C8982]">
              <span>NODE_03 // DIAGNOSTICS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#141413]" />
            </div>
            <div className="font-grotesk font-semibold text-xs text-[#141413]">RAG Cycle Oracles</div>
            <p className="font-mono text-[10.5px] text-[#595751] leading-relaxed">
              Formal Wait-For Graph cycle detection and stale-read lost update flagging.
            </p>
          </div>

          <div className="p-4 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[9.5px] text-[#8C8982]">
              <span>NODE_04 // CORPUS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857]" />
            </div>
            <div className="font-grotesk font-semibold text-xs text-[#141413]">10 Classic Labs</div>
            <p className="font-mono text-[10.5px] text-[#595751] leading-relaxed">
              From race counters and mutex queues to bounded buffers and dining philosophers.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Experiments: Microscopic Blueprint Cards */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#141413]/20 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.12em] uppercase text-[#9E381E] font-semibold mb-1">
              <span className="w-4 h-[1px] bg-[#9E381E]" />
              <span>SEC_02 // FEATURED EXPERIMENTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-grotesk font-semibold tracking-tight text-[#141413]">
              Choose a concept to explore
            </h2>
          </div>

          <button
            type="button"
            onClick={scrollToLabs}
            className="text-[11px] font-mono text-[#595751] hover:text-[#141413] flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>VIEW_ALL_LABS [10]</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredExperiments.map((card) => (
            <button
              key={card.id}
              type="button"
              tabIndex={0}
              onClick={() => handleLaunch(card.scenarioId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLaunch(card.scenarioId);
                }
              }}
              aria-label={`Explore ${card.title} experiment`}
              className="w-full text-left border border-[#141413]/25 bg-[#FAF9F5] hover:bg-white hover:border-[#141413] p-4 flex flex-col justify-between transition-colors cursor-pointer group min-h-[265px] focus:outline-none focus:ring-1 focus:ring-[#141413]"
            >
              <div className="w-full">
                {/* Micro Top Header */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#595751] border-b border-dashed border-[#141413]/20 pb-1.5">
                  <span className="font-bold text-[#141413]">[{card.id}]</span>
                  <span className="tracking-wider">{card.code}</span>
                </div>

                {/* Blueprint Schematic Stage with dotted grid */}
                <div className="w-full h-32 flex items-center justify-center my-2.5 bg-micro-dashed-grid border border-[#141413]/10 overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]">
                  {card.illustration}
                </div>

                {/* Title */}
                <h3 className="text-sm font-grotesk font-semibold text-[#141413] group-hover:text-[#9E381E] transition-colors">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-[11px] font-mono text-[#595751] leading-relaxed mt-1">
                  {card.description}
                </p>
              </div>

              {/* Micro Footer Bar */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#141413]/15 w-full font-mono text-[10px] text-[#595751]">
                <span>STATUS: READY</span>
                <span className="text-[#141413] font-bold group-hover:text-[#9E381E] flex items-center gap-1">
                  <span>LAUNCH</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Complete Laboratory Corpus (All 10 Experiments in Microscopic Index Grid) */}
      <section id="simulation-labs" className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-6 scroll-mt-16 border-t border-[#141413]/20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-[#141413]/20">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#9E381E] font-semibold mb-1">
              SEC_03 // COMPLETE LABORATORY CORPUS
            </div>
            <h2 className="font-grotesk font-semibold text-2xl sm:text-3xl text-[#141413] tracking-tight">
              10 Operating Systems Laboratories
            </h2>
          </div>
          <div className="text-[11px] font-mono text-[#595751] px-2.5 py-1 border border-[#141413]/25 bg-white">
            ENGINE_EXECUTION: NATIVE C++20
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fullModules.map((m) => (
            <button
              key={m.id}
              type="button"
              tabIndex={0}
              onClick={() => handleLaunch(m.scenarioId)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleLaunch(m.scenarioId);
                }
              }}
              aria-label={`Launch ${m.title} module`}
              className="w-full text-left group p-4 bg-[#FAF9F5] hover:bg-white border border-[#141413]/25 hover:border-[#141413] transition-colors cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-1 focus:ring-[#141413]"
            >
              <div className="space-y-2.5 w-full">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#595751] pb-2 border-b border-dashed border-[#141413]/20">
                  <span className="font-bold text-[#9E381E]">{m.index} // {m.category}</span>
                  <div className="flex items-center gap-1.5">
                    <span>{m.difficulty}</span>
                    <span>•</span>
                    <span>{m.steps}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-grotesk font-semibold text-sm text-[#141413] group-hover:text-[#9E381E] transition-colors flex items-center justify-between">
                    <span>{m.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#9E381E]" />
                  </h3>
                  <p className="font-mono text-[11px] text-[#595751] leading-relaxed mt-1.5">
                    {m.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-[#141413]/15 flex items-center justify-between text-[10px] font-mono text-[#595751] w-full">
                <span className="truncate pr-2">{m.outcome}</span>
                <span className="text-[#141413] group-hover:text-[#9E381E] font-bold flex-shrink-0">OPEN &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
