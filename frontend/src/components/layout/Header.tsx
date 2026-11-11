import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Layers } from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'workspace' | 'docs';
  setCurrentTab: (tab: 'dashboard' | 'workspace' | 'docs') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    theme, 
    toggleTheme, 
    isBackendConnected
  } = useSimulationStore();

  return (
    <header className="border-b border-[#E2DDD4] bg-[#FBF4EA] sticky top-0 z-50 px-3 sm:px-8 lg:px-12 py-2.5 sm:py-3 select-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4 min-w-0">
        {/* 1. Brand with System/Architecture Logo Icon */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-2 text-left focus:outline-none cursor-pointer group"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#18181B] flex items-center justify-center text-white shadow-xs group-hover:bg-black transition-colors flex-shrink-0">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="font-bold tracking-tight text-[#18181B] text-xs sm:text-base font-sans">
              ConcurrencyLab
            </span>
          </button>
        </div>

        {/* 2. Center Editorial Text Navigation */}
        <nav className="flex items-center gap-3 sm:gap-6 md:gap-8 flex-shrink-0">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`pb-1 text-xs sm:text-sm font-medium transition-colors cursor-pointer relative ${
              currentTab === 'dashboard'
                ? 'text-[#18181B] font-semibold'
                : 'text-[#78716C] hover:text-[#18181B]'
            }`}
          >
            <span>Dashboard</span>
            {currentTab === 'dashboard' && (
              <span className="absolute -bottom-[11px] sm:-bottom-[13px] left-0 right-0 h-[2px] bg-[#9E381E]" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('workspace')}
            className={`pb-1 text-xs sm:text-sm font-medium transition-colors cursor-pointer relative ${
              currentTab === 'workspace'
                ? 'text-[#18181B] font-semibold'
                : 'text-[#78716C] hover:text-[#18181B]'
            }`}
          >
            <span>Workspace</span>
            {currentTab === 'workspace' && (
              <span className="absolute -bottom-[11px] sm:-bottom-[13px] left-0 right-0 h-[2px] bg-[#9E381E]" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('docs')}
            className={`pb-1 text-xs sm:text-sm font-medium transition-colors cursor-pointer relative ${
              currentTab === 'docs'
                ? 'text-[#18181B] font-semibold'
                : 'text-[#78716C] hover:text-[#18181B]'
            }`}
          >
            <span>Docs</span>
            {currentTab === 'docs' && (
              <span className="absolute -bottom-[11px] sm:-bottom-[13px] left-0 right-0 h-[2px] bg-[#9E381E]" />
            )}
          </button>
        </nav>

        {/* 3. Right Actions: C++ Engine Status & Contrast Toggle */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* C++ Native Engine Status Pill */}
          <div 
            title={isBackendConnected ? "Native C++20 Simulation Core: Connected (Port 3001)" : "Native C++20 Simulation Core: Cached Engine Run"}
            className="flex items-center gap-1.5 text-[11px] font-mono text-[#57534E] px-2 py-0.5 border border-[#DDD6CB] bg-[#F4EFE7]"
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-600' : 'bg-stone-500'}`} />
            <span className="hidden sm:inline font-medium">C++20 IPC</span>
          </div>

          {/* Editorial Split-Circle Contrast / Theme Icon */}
          <button
            onClick={toggleTheme}
            title={`Current theme: ${theme}. Click to toggle.`}
            className="w-5 h-5 rounded-full border border-[#18181B] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer overflow-hidden"
          >
            <div className="w-full h-full flex">
              <div className="w-1/2 h-full bg-[#18181B]" />
              <div className="w-1/2 h-full bg-[#FBF4EA]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
