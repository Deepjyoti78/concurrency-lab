import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { HeroIsometricScene } from './HeroIsometricScene';
import { RaceConditionsThumbnail } from '../../components/illustrations/RaceConditionsThumbnail';
import { CpuCoreSocket } from '../../components/illustrations/CpuCoreSocket';
import { MutexPadlock } from '../../components/illustrations/MutexPadlock';
import { RagCycleThumbnail } from '../../components/illustrations/RagCycleThumbnail';
import { ArrowRight, ArrowDown } from 'lucide-react';

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

  // Featured Experiments (matching the 4 cards in the mockup)
  const featuredExperiments = [
    {
      id: '01',
      title: 'Race Conditions',
      scenarioId: 'race_counter_2',
      description: 'See how interleaving leads to unexpected results.',
      illustration: <RaceConditionsThumbnail />,
      bgClass: 'bg-[#FBF8F3]'
    },
    {
      id: '02',
      title: 'Thread Scheduling',
      scenarioId: 'mutex_counter_2',
      description: 'Understand how the scheduler allocates CPU time.',
      illustration: <CpuCoreSocket />,
      bgClass: 'bg-[#F2F7F4]' // subtle sage tint matching mockup
    },
    {
      id: '03',
      title: 'Mutual Exclusion',
      scenarioId: 'mutex_contention',
      description: 'Learn how locks protect shared resources.',
      illustration: <MutexPadlock />,
      bgClass: 'bg-[#FBF8F3]'
    },
    {
      id: '04',
      title: 'Deadlocks',
      scenarioId: 'deadlock_circular_wait',
      description: 'Explore circular dependencies and how to avoid them.',
      illustration: <RagCycleThumbnail />,
      bgClass: 'bg-[#FBF8F3]'
    }
  ];

  // Full Laboratory Modules Catalog
  const fullModules = [
    {
      id: 'race-conditions',
      scenarioId: 'race_counter_2',
      category: 'Data Race',
      difficulty: 'Beginner',
      title: 'Two-Thread Race',
      description: "Find the instruction that overwrites the first thread's increment without synchronization.",
      steps: '6 steps',
      outcome: 'Lost Update: counter=1 (Expected 2)'
    },
    {
      id: 'race-conditions-3',
      scenarioId: 'race_counter_3',
      category: 'Data Race',
      difficulty: 'Beginner',
      title: 'Three-Thread Race',
      description: 'Three concurrent workers execute unsynchronized read-add-write sequences.',
      steps: '9 steps',
      outcome: 'Multiple overwritten writes across 3 threads'
    },
    {
      id: 'mutex',
      scenarioId: 'mutex_counter_2',
      category: 'Mutual Exclusion',
      difficulty: 'Beginner',
      title: 'Mutex Protection',
      description: 'See how a mutex lock serializes critical sections and lets both increments reach memory safely.',
      steps: '10 steps',
      outcome: 'Critical section isolated: counter=2 (Correct)'
    },
    {
      id: 'mutex-contention',
      scenarioId: 'mutex_contention',
      category: 'Mutual Exclusion',
      difficulty: 'Intermediate',
      title: 'Lock Contention',
      description: 'Three worker threads compete for a single critical section with FIFO waiter queuing.',
      steps: '15 steps',
      outcome: 'FIFO order preserved • Zero contention leaks'
    },
    {
      id: 'semaphores',
      scenarioId: 'counting_semaphore',
      category: 'Semaphores',
      difficulty: 'Intermediate',
      title: 'Counting Semaphore',
      description: 'Regulate concurrent access to a shared resource pool constrained to capacity 2.',
      steps: '32 steps',
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
      id: 'deadlocks',
      scenarioId: 'deadlock_circular_wait',
      category: 'Deadlock',
      difficulty: 'Intermediate',
      title: 'Circular Wait Deadlock',
      description: 'Follow two threads acquiring locks in reverse order until each freezes waiting for the other.',
      steps: '4 steps',
      outcome: 'Tarjan SCC cycle detected • Mutual dependency freeze'
    },
    {
      id: 'deadlock-free',
      scenarioId: 'deadlock_free_hierarchy',
      category: 'Deadlock',
      difficulty: 'Intermediate',
      title: 'Lock Hierarchy',
      description: 'Observe how enforcing a global total ordering on lock acquisitions mathematically prevents deadlocks.',
      steps: '10 steps',
      outcome: 'Zero cycles • Both threads complete cleanly'
    },
    {
      id: 'dining-philosophers-deadlock',
      scenarioId: 'dining_philosophers_deadlock',
      category: 'Classical Anomaly',
      difficulty: 'Advanced',
      title: 'Dining Philosophers Deadlock',
      description: 'Observe 5 philosophers pick up their left fork simultaneously and freeze in symmetric circular wait.',
      steps: '15 steps',
      outcome: '5-way circular wait deadlock on shared fork resources'
    },
    {
      id: 'dining-philosophers-safe',
      scenarioId: 'dining_philosophers_safe',
      category: 'Classical Anomaly',
      difficulty: 'Advanced',
      title: 'Safe Dining Philosophers',
      description: 'Break symmetry by having odd philosophers pick left fork first and even pick right fork first.',
      steps: '30 steps',
      outcome: 'Deadlock-free execution • All 5 eat and terminate safely'
    }
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 space-y-12 sm:space-y-16 bg-[#FBF8F3] text-[#18181B] overflow-x-hidden select-none">
      {/* 1. Hero Section (Matching Mockup) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-2">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6 pr-0 lg:pr-2">
          {/* Badge Pill: Trusted by 135K+ people */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#DDD6CB] bg-[#F4EFE7] text-xs font-sans text-[#57534E]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>Trusted by 135K+ people</span>
          </div>

          {/* Editorial Headline: Concurrency, made visible. */}
          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-[54px] leading-[1.08] tracking-tight text-[#18181B]">
            Concurrency,<br />
            <span className="font-editorial-italic font-normal text-[#9E381E]">made visible.</span>
          </h1>

          {/* Subheading */}
          <p className="text-[#57534E] text-sm sm:text-base leading-relaxed max-w-lg font-normal">
            Explore real concurrency problems through interactive simulations. Run, trace, and understand how threads, shared state, and synchronization work in real programs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={() => handleLaunch('race_counter_2')}
              className="px-5 py-2.5 rounded-lg bg-[#9E381E] hover:bg-[#852E17] text-white font-medium text-xs sm:text-sm tracking-wide transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Start the lab</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </button>

            <button
              onClick={scrollToLabs}
              className="px-4 py-2.5 rounded-lg border border-[#DDD6CB] bg-[#FAF6EE] hover:bg-[#F4EFE7] text-[#18181B] font-medium text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Browse experiments</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Micro-label: Comprehensive Care */}
          <div className="pt-3 border-t border-[#E6E0D6] space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-[#9E381E] font-semibold">
              <span className="w-4 h-[1px] bg-[#9E381E]" />
              <span>Comprehensive Care</span>
            </div>
            <p className="text-xs text-[#57534E]">
              Learn by doing. Build real understanding.
            </p>
          </div>
        </div>

        {/* Right Column: Hero Interactive Isometric Scene */}
        <div className="lg:col-span-7 flex justify-center w-full min-w-0">
          <HeroIsometricScene onOpenWorkspace={handleLaunch} />
        </div>
      </section>

      {/* 2. Feature Strip (Matching Mockup) */}
      <section className="border-y border-[#DDD6CB] bg-[#F4EFE7]/60 -mx-4 sm:-mx-8 lg:-mx-12 px-4 sm:px-8 lg:px-12 py-4 sm:py-5">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-x-0 md:divide-x divide-[#DDD6CB]">
          {/* Item 1 */}
          <div className="flex items-start gap-2.5 md:pr-4">
            <span className="w-2 h-2 rounded-full bg-[#9E381E] mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#18181B]">C++20 Engine Truth</div>
              <p className="text-[11px] text-[#57534E] leading-relaxed mt-0.5">
                Real-time instruction dispatcher, virtual thread state
              </p>
            </div>
          </div>

          {/* Item 2 */}
          <div className="flex items-start gap-2.5 md:px-4">
            <span className="w-2 h-2 rounded-full bg-[#18181B] mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#18181B]">Deterministic Replay</div>
              <p className="text-[11px] text-[#57534E] leading-relaxed mt-0.5">
                Step forward and backward, always
              </p>
            </div>
          </div>

          {/* Item 3 */}
          <div className="flex items-start gap-2.5 md:px-4">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#18181B]">RAG Cycle Oracles</div>
              <p className="text-[11px] text-[#57534E] leading-relaxed mt-0.5">
                Detect deadlocks and resource conflicts
              </p>
            </div>
          </div>

          {/* Item 4 */}
          <div className="flex items-start gap-2.5 md:pl-4">
            <span className="w-2 h-2 rounded-full bg-[#10B981] mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#18181B]">10 Classic Labs</div>
              <p className="text-[11px] text-[#57534E] leading-relaxed mt-0.5">
                From race conditions to dining philosophers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Experiments Section (Matching Mockup 4 Cards) */}
      <section className="space-y-5 pt-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider uppercase text-[#9E381E] font-semibold mb-1">
              <span className="w-4 h-[1px] bg-[#9E381E]" />
              <span>FEATURED EXPERIMENTS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-editorial font-bold text-[#18181B]">
              Choose a concept to explore
            </h2>
          </div>

          <button
            onClick={scrollToLabs}
            className="text-xs font-medium text-[#78716C] hover:text-[#18181B] flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>View all experiments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredExperiments.map((card) => (
            <div
              key={card.id}
              onClick={() => handleLaunch(card.scenarioId)}
              className={`rounded-2xl border border-[#DDD6CB] ${card.bgClass} p-4 sm:p-5 flex flex-col justify-between hover:border-[#18181B] hover:shadow-xs transition-all cursor-pointer group min-h-[220px]`}
            >
              <div>
                {/* Number */}
                <div className="text-[11px] font-mono text-[#78716C] mb-2 font-medium">
                  {card.id}
                </div>

                {/* Card Vector Illustration */}
                <div className="w-full h-24 flex items-center justify-center my-2 overflow-hidden">
                  {card.illustration}
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-[#18181B] font-sans group-hover:text-[#9E381E] transition-colors mt-2">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-[#57534E] leading-relaxed mt-1">
                  {card.description}
                </p>
              </div>

              {/* Bottom Right Arrow Button */}
              <div className="flex justify-end pt-3">
                <div className="w-7 h-7 rounded-full border border-[#DDD6CB] bg-white group-hover:bg-[#18181B] group-hover:text-white group-hover:border-[#18181B] flex items-center justify-center text-[#57534E] transition-all">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Complete Laboratory Corpus (All 10 Experiments) */}
      <section id="simulation-labs" className="space-y-6 pt-4 scroll-mt-20 border-t border-[#DDD6CB]">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#9E381E] font-semibold mb-1">
              Complete Laboratory Corpus
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl text-[#18181B] tracking-tight">
              10 Interactive Operating Systems Laboratories
            </h2>
          </div>
          <div className="text-xs font-mono text-[#57534E]">
            All 10 experiments powered by native C++20 engine
          </div>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fullModules.map((m) => (
            <div
              key={m.id}
              onClick={() => handleLaunch(m.scenarioId)}
              className="group p-4 sm:p-5 bg-[#FAF6EE] hover:bg-white border border-[#DDD6CB] hover:border-[#18181B] transition-all cursor-pointer flex flex-col justify-between rounded-xl shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#78716C] pb-2 border-b border-[#EFEAE2]">
                  <span className="font-semibold text-[#9E381E] uppercase">{m.category}</span>
                  <div className="flex items-center gap-2">
                    <span>{m.difficulty}</span>
                    <span>•</span>
                    <span>{m.steps}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-sans font-bold text-sm text-[#18181B] group-hover:text-[#9E381E] transition-colors flex items-center justify-between">
                    <span>{m.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#9E381E]" />
                  </h3>
                  <p className="text-xs text-[#57534E] leading-relaxed mt-1.5 font-normal">
                    {m.description}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EFEAE2] flex items-center justify-between text-[11px] font-mono text-[#78716C]">
                <span className="truncate pr-2">{m.outcome}</span>
                <span className="text-[#9E381E] font-bold group-hover:underline flex-shrink-0">Launch &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
