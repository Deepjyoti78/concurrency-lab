import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { InteractiveTraceHero } from './InteractiveTraceHero';
import { ArrowRight, ArrowDown } from 'lucide-react';

interface DashboardProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenWorkspace }) => {
  const { loadScenario } = useSimulationStore();

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
      title: 'Race conditions',
      description: "Find the instruction that overwrites the first thread's increment.",
      steps: '6 steps'
    },
    {
      id: 'mutex',
      scenarioId: 'mutex_counter_2',
      title: 'Mutual exclusion',
      description: 'See how a mutex lets both increments reach the shared counter.',
      steps: '8 steps'
    },
    {
      id: 'deadlocks',
      scenarioId: 'deadlock_circular_wait',
      title: 'Deadlocks',
      description: "Follow two threads until each is waiting for the other's lock.",
      steps: '4 steps'
    },
    {
      id: 'semaphores',
      scenarioId: 'counting_semaphore',
      title: 'Semaphores',
      description: 'Regulate concurrent access to a resource pool of capacity 2.',
      steps: '8 steps'
    },
    {
      id: 'producer-consumer',
      scenarioId: 'producer_consumer_3',
      title: 'Producer-Consumer',
      description: 'Coordinate producer and consumer through a 3-slot bounded buffer.',
      steps: '32 steps'
    },
    {
      id: 'dining-philosophers',
      scenarioId: 'dining_philosophers_deadlock',
      title: 'Dining Philosophers',
      description: 'Observe 5 philosophers enter a symmetric circular wait deadlock.',
      steps: '15 steps'
    }
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-14 space-y-16 sm:space-y-24 bg-[#FBF4EA] text-[#18181B] overflow-x-hidden select-none">
      {/* 1. Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start pt-2 sm:pt-4">
        {/* Left Column: Editorial Headline & Actions */}
        <div className="lg:col-span-7 space-y-6 sm:space-y-8 pr-0 lg:pr-6">
          {/* Micro-label */}
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.16em] uppercase text-[#44403C]">
            <span className="w-5 h-[1.5px] bg-[#9E381E] inline-block" />
            <span>INTERACTIVE COMPUTER SCIENCE LABORATORY</span>
          </div>

          {/* Editorial Headline */}
          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.05] tracking-tight text-[#18181B]">
            Multithreading,<br />
            <span className="font-editorial-italic font-normal text-[#9E381E]">one step at a time.</span>
          </h1>

          {/* Subheading */}
          <p className="text-[#57534E] text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-normal">
            Step through two threads, inspect shared state, and see where a race condition or deadlock begins.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
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
        </div>

        {/* Right Column: Live Interactive Trace Card */}
        <div className="lg:col-span-5 flex justify-center w-full min-w-0">
          <InteractiveTraceHero onOpenWorkspace={onOpenWorkspace} />
        </div>
      </section>

      {/* 2. Simulation Labs Section */}
      <section id="simulation-labs" className="space-y-6 pt-4 scroll-mt-20">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
          <div>
            <h2 className="font-editorial text-3xl sm:text-4xl md:text-[42px] font-normal text-[#18181B] tracking-tight">
              Simulation labs
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1 font-normal">
              Choose a trace to open in the workspace.
            </p>
          </div>

          <button
            onClick={() => onOpenWorkspace()}
            className="text-xs sm:text-sm font-semibold text-[#18181B] hover:text-[#9E381E] flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto py-1"
          >
            <span>Open workspace</span>
            <span>→</span>
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
                  isRightBorder ? 'lg:border-r' : ''
                } ${
                  (idx + 1) % 2 !== 0 ? 'md:border-r lg:border-r-0' : ''
                } ${
                  isRightBorder ? 'lg:border-r border-[#DDD6CB]' : ''
                } bg-[#FBF4EA] hover:bg-[#F4EFE7] transition-all cursor-pointer group flex flex-col justify-between min-h-[170px]`}
              >
                {/* Top Row: Title & Arrow */}
                <div>
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#18181B] group-hover:text-black transition-colors">
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

                {/* Bottom Row: Steps Count */}
                <div className="pt-4 mt-2">
                  <span className="text-[11px] font-mono text-[#9E381E] font-semibold tracking-wide">
                    {m.steps}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
