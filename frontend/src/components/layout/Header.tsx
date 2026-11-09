import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { 
  Cpu, 
  Sun, 
  Moon, 
  RotateCcw, 
  Layers, 
  Activity, 
  Terminal
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'workspace' | 'docs';
  setCurrentTab: (tab: 'dashboard' | 'workspace' | 'docs') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    theme, 
    toggleTheme, 
    reset, 
    currentScenarioId, 
    scenarios, 
    loadScenario,
    isBackendConnected
  } = useSimulationStore();

  return (
    <header className="border-b border-[#1F2E4D] bg-[#0E1524]/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-6 py-2.5">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-slate-100 text-sm">ConcurrencyLab</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
                  C++20 Core
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Deterministic OS Multithreading Simulator</p>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-[#162035]/80 p-1 rounded-lg border border-[#1F2E4D]">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2B47]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => setCurrentTab('workspace')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'workspace'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2B47]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Laboratory Workspace
          </button>
          <button
            onClick={() => setCurrentTab('docs')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E2B47]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Architecture & Docs
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Scenario Selector */}
          <div className="hidden md:flex items-center">
            <select
              value={currentScenarioId}
              onChange={(e) => {
                loadScenario(e.target.value);
                if (currentTab !== 'workspace') setCurrentTab('workspace');
              }}
              className="bg-[#162035] border border-[#1F2E4D] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-[#0E1524] text-slate-200">
                  {sc.title}
                </option>
              ))}
            </select>
          </div>

          {/* Engine Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-[#162035] border border-[#1F2E4D] text-[11px] font-mono text-slate-300">
            <div className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
            <span>{isBackendConnected ? 'Live C++ IPC' : 'C++ Engine Cache'}</span>
          </div>

          {/* Reset */}
          <button
            onClick={reset}
            title="Reset Simulation State"
            className="p-1.5 rounded-lg border border-[#1F2E4D] text-slate-400 hover:text-slate-200 hover:bg-[#162035] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Light/Dark Theme"
            className="p-1.5 rounded-lg border border-[#1F2E4D] text-slate-400 hover:text-slate-200 hover:bg-[#162035] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
