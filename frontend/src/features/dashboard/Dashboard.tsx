import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { HeroConsole } from './HeroConsole';
import { 
  FlaskConical, 
  Play, 
  ArrowRight, 
  Code2, 
  Layers, 
  AlertTriangle, 
  Network, 
  Flag, 
  Lock, 
  RefreshCw, 
  Sliders, 
  Utensils, 
  Box,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenWorkspace }) => {
  const { loadScenario } = useSimulationStore();

  const handleLaunch = (scenarioId: string) => {
    loadScenario(scenarioId);
    onOpenWorkspace(scenarioId);
  };

  const modules = [
    {
      id: 'race-conditions',
      scenarioId: 'race_counter_2',
      title: 'Race Conditions',
      subtitle: 'Explore data races and lost updates.',
      icon: Flag,
      featured: true,
    },
    {
      id: 'deadlocks',
      scenarioId: 'deadlock_circular_wait',
      title: 'Deadlocks',
      subtitle: 'Create, detect, and resolve deadlocks.',
      icon: Lock,
      featured: false,
    },
    {
      id: 'mutex',
      scenarioId: 'mutex_counter_2',
      title: 'Synchronization',
      subtitle: 'Mutex, condition variables, and ordering.',
      icon: RefreshCw,
      featured: false,
    },
    {
      id: 'semaphores',
      scenarioId: 'counting_semaphore',
      title: 'Semaphores',
      subtitle: 'Counting semaphores and pool regulation.',
      icon: Sliders,
      featured: false,
    },
    {
      id: 'producer-consumer',
      scenarioId: 'producer_consumer_3',
      title: 'Producer-Consumer',
      subtitle: 'Bounded buffer with capacity invariants.',
      icon: Box,
      featured: false,
    },
    {
      id: 'dining-philosophers',
      scenarioId: 'dining_philosophers_deadlock',
      title: 'Dining Philosophers',
      subtitle: 'Circular wait and asymmetric resolution.',
      icon: Utensils,
      featured: false,
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 py-6 sm:py-12 space-y-8 sm:space-y-12 bg-[#FBF4EA] text-[#18181B] overflow-x-hidden">
      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-1 sm:pt-2">
        {/* Left Column: Headline and Call to Actions */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-[#DDD6CB] bg-[#F4EFE7]/80 text-[#44403C] text-[11px] sm:text-xs font-semibold shadow-xs">
            <FlaskConical className="w-3.5 h-3.5 text-[#18181B]" />
            <span>Interactive Computer Science Laboratory</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-[#18181B] leading-[1.2] sm:leading-[1.15] break-words">
            Understand Multithreading <br className="hidden sm:inline" />
            at the <span className="font-serif-italic font-normal text-[#18181B]">Instruction Level.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-[#57534E] text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
            ConcurrencyLab connects a deterministic <strong className="text-[#18181B] font-semibold">C++20 simulation engine</strong> to 
            an interactive visual debugger. Step through instruction-by-instruction interleavings, 
            inspect registers and shared memory, uncover race conditions, and dissect deadlocks with mathematical precision.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1 sm:pt-2">
            <button
              onClick={() => handleLaunch('race_counter_2')}
              className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-[#18181B] hover:bg-black text-white font-semibold text-xs tracking-wide shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Quick Start: Two-Thread Race</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
            <button
              onClick={() => onOpenWorkspace()}
              className="px-5 py-2.5 sm:py-3 rounded-full bg-[#F8F5EE] hover:bg-[#EFEAE2] text-[#18181B] border border-[#DDD6CB] font-semibold text-xs tracking-wide shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <FlaskConical className="w-3.5 h-3.5 text-[#57534E]" />
              <span>Enter Laboratory Workspace</span>
            </button>
          </div>
        </div>

        {/* Right Column: Physical Concurrency Hardware Console */}
        <div className="lg:col-span-5 flex justify-center w-full min-w-0 overflow-hidden">
          <HeroConsole onEnterWorkspace={() => onOpenWorkspace()} />
        </div>
      </div>

      {/* Feature Highlights Bar (4 Columns with vertical dividers) */}
      <div className="rounded-xl sm:rounded-2xl border border-[#E6E0D6] bg-[#F4EFE7]/50 p-4 sm:p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-[#E6E0D6]">
          {/* Item 1 */}
          <div className="space-y-1 sm:px-4 first:pl-0">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <Code2 className="w-4 h-4 text-[#18181B]" />
              <span>C++20 Engine Truth</span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              All events computed by native compiled C++ logic.
            </p>
          </div>

          {/* Item 2 */}
          <div className="space-y-1 pt-3 sm:pt-0 sm:px-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <Layers className="w-4 h-4 text-[#18181B]" />
              <span>Deterministic Time-Travel</span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Scrub forward and backward with state snapshots.
            </p>
          </div>

          {/* Item 3 */}
          <div className="space-y-1 pt-3 sm:pt-0 sm:px-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <AlertTriangle className="w-4 h-4 text-[#18181B]" />
              <span>Educational Detection</span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Automated diagnosis of lost updates & R/W races.
            </p>
          </div>

          {/* Item 4 */}
          <div className="space-y-1 pt-3 sm:pt-0 sm:px-4 last:pr-0">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <Network className="w-4 h-4 text-[#18181B]" />
              <span>Multiple Schedulers</span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Round Robin, FIFO, Seeded Random, and Manual.
            </p>
          </div>
        </div>
      </div>

      {/* Simulation Laboratories Header & Cards */}
      <div className="space-y-4 sm:space-y-6 pt-1 sm:pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-[#18181B]" />
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-[#18181B]">
                Simulation Laboratories
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#78716C]">
              Select a computer science laboratory module to explore interactive experiments.
            </p>
          </div>

          <button
            onClick={() => onOpenWorkspace()}
            className="self-start sm:self-auto px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#18181B] hover:bg-black text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>6 Modules • 10 Experiments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 6 Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {modules.map((m) => {
            const Icon = m.icon;
            if (m.featured) {
              return (
                <div
                  key={m.id}
                  onClick={() => handleLaunch(m.scenarioId)}
                  className="rounded-xl sm:rounded-2xl bg-[#18181B] text-white border border-[#27272A] p-4 sm:p-5 flex items-center justify-between shadow-xs hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#27272A] flex items-center justify-center text-white flex-shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-stone-200 transition-colors">
                        {m.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-[#A8A29E] mt-0.5">
                        {m.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#27272A] group-hover:bg-[#3F3F46] flex items-center justify-center text-white transition-colors flex-shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                onClick={() => handleLaunch(m.scenarioId)}
                className="rounded-xl sm:rounded-2xl bg-[#F4EFE7] hover:bg-[#EAE4D9] text-[#18181B] border border-[#DDD6CB] p-4 sm:p-5 flex items-center justify-between shadow-xs hover:shadow-sm hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-[#EFEAE2] flex items-center justify-center text-[#18181B] flex-shrink-0">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#18181B] group-hover:text-black transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-[#78716C] mt-0.5">
                      {m.subtitle}
                    </p>
                  </div>
                </div>

                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E5DFD4] group-hover:bg-[#DBD4C8] flex items-center justify-center text-[#18181B] transition-colors flex-shrink-0">
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
