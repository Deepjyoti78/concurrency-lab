import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { 
  Zap, 
  Lock, 
  Sliders, 
  RefreshCw, 
  Utensils, 
  AlertTriangle, 
  Play, 
  ArrowRight,
  ShieldCheck,
  Cpu,
  History,
  GitBranch
} from 'lucide-react';

interface DashboardProps {
  onOpenWorkspace: (scenarioId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenWorkspace }) => {
  const { loadScenario, scenarios } = useSimulationStore();

  const handleLaunch = (scenarioId: string) => {
    loadScenario(scenarioId);
    onOpenWorkspace(scenarioId);
  };

  const modules = [
    {
      id: 'race-conditions',
      title: 'Race Conditions',
      icon: Zap,
      accent: 'indigo',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      description: 'Observe non-atomic operations, decomposed reads and writes, and lost updates on shared counters.',
      difficulty: 'Beginner',
      experiments: scenarios.filter(s => s.moduleId === 'race-conditions'),
      previewNote: 'Decomposes counter++ into READ -> ADD -> WRITE, proving why T1=0 and T2=0 leads to lost work.'
    },
    {
      id: 'mutex',
      title: 'Mutex & Synchronization',
      icon: Lock,
      accent: 'emerald',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Explore mutual exclusion, lock contention, critical sections, and thread wake-up cascades.',
      difficulty: 'Beginner to Intermediate',
      experiments: scenarios.filter(s => s.moduleId === 'mutex'),
      previewNote: 'Visualizes lock contention: thread blocking into FIFO queues and seamless lock ownership handover.'
    },
    {
      id: 'semaphores',
      title: 'Semaphores',
      icon: Sliders,
      accent: 'blue',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Master Dijkstra counting semaphores, wait() / signal() primitives, and resource pool throttles.',
      difficulty: 'Intermediate',
      experiments: scenarios.filter(s => s.moduleId === 'semaphores'),
      previewNote: 'Controls a multi-connection resource pool where multiple threads can hold permits up to capacity.'
    },
    {
      id: 'producer-consumer',
      title: 'Producer-Consumer',
      icon: RefreshCw,
      accent: 'amber',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Simulate bounded-buffer synchronization using dual counting semaphores and a mutual exclusion lock.',
      difficulty: 'Advanced',
      experiments: scenarios.filter(s => s.moduleId === 'producer-consumer'),
      previewNote: 'Strict capacity invariant: buffer never exceeds 3 items or drops below 0.'
    },
    {
      id: 'dining-philosophers',
      title: 'Dining Philosophers',
      icon: Utensils,
      accent: 'purple',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'The definitive concurrency benchmark: 5 philosophers, 5 forks, circular wait, and asymmetric resolution.',
      difficulty: 'Advanced',
      experiments: scenarios.filter(s => s.moduleId === 'dining-philosophers'),
      previewNote: 'Demonstrates simultaneous left-fork acquisition deadlock and the resource-hierarchy fix.'
    },
    {
      id: 'deadlocks',
      title: 'Deadlock Detection',
      icon: AlertTriangle,
      accent: 'rose',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      description: 'Analyze Resource Allocation Graphs (RAG) and Wait-For Graphs (WFG) with automated cycle detection.',
      difficulty: 'Intermediate',
      experiments: scenarios.filter(s => s.moduleId === 'deadlocks'),
      previewNote: 'Interactive directed graph highlighting circular wait cycles with Tarjan cycle analysis.'
    }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#111A2E] to-[#0B101D] border border-[#1F2E4D] p-6 sm:p-10 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>Interactive Computer Science Laboratory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Understand Multithreading <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400">
              at the Instruction Level.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            ConcurrencyLab connects a deterministic <strong className="text-white">C++20 simulation engine</strong> to 
            an interactive visual debugger. Step through instruction-by-instruction interleavings, inspect registers 
            and shared memory, uncover race conditions, and dissect deadlocks with mathematical precision.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleLaunch('race_counter_2')}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Quick Start: Two-Thread Race Condition
            </button>
            <button
              onClick={() => onOpenWorkspace()}
              className="px-5 py-2.5 rounded-lg bg-[#162035] hover:bg-[#1E2B47] text-slate-200 border border-[#1F2E4D] font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              Enter Laboratory Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Grid Banner */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-10 mt-10 border-t border-[#1F2E4D]/80">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>C++20 Engine Truth</span>
            </div>
            <p className="text-xs text-slate-400">All events computed by native compiled C++ logic.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
              <History className="w-3.5 h-3.5" />
              <span>Deterministic Time-Travel</span>
            </div>
            <p className="text-xs text-slate-400">Scrub forward and backward with state snapshots.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Educational Detection</span>
            </div>
            <p className="text-xs text-slate-400">Automated diagnosis of lost updates & RAG cycles.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-purple-400">
              <GitBranch className="w-3.5 h-3.5" />
              <span>Multiple Schedulers</span>
            </div>
            <p className="text-xs text-slate-400">Round Robin, FIFO, Seeded Random, and Manual.</p>
          </div>
        </div>
      </div>

      {/* Module Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Simulation Laboratories</h2>
            <p className="text-sm text-slate-400">Select a computer science laboratory module to explore interactive experiments.</p>
          </div>
          <span className="text-xs font-mono text-slate-400 px-2.5 py-1 rounded bg-[#111A2E] border border-[#1F2E4D]">
            6 Modules • 10 Experiments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div 
                key={m.id}
                className="rounded-xl bg-[#0E1524] border border-[#1F2E4D] hover:border-[#334A77] transition-all flex flex-col justify-between overflow-hidden group shadow-md"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#162035] border border-[#1F2E4D] flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${m.badgeColor}`}>
                      {m.difficulty}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[#090D16] border border-[#1F2E4D] text-[11px] text-slate-400 font-mono">
                    <div className="text-[10px] uppercase text-slate-500 mb-1">Engine Simulation Model</div>
                    {m.previewNote}
                  </div>
                </div>

                {/* Experiments List */}
                <div className="border-t border-[#1F2E4D] bg-[#0A101C] p-4 space-y-2">
                  <div className="text-[10px] uppercase font-mono text-slate-500 font-semibold px-1">
                    Available Experiments ({m.experiments.length})
                  </div>
                  <div className="space-y-1.5">
                    {m.experiments.map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => handleLaunch(exp.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-md bg-[#111A2E] hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-medium flex items-center justify-between group/exp transition-colors border border-transparent hover:border-indigo-400 cursor-pointer"
                      >
                        <span className="truncate pr-2">{exp.title}</span>
                        <Play className="w-3 h-3 opacity-0 group-hover/exp:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
