import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { 
  Layers, 
  Home, 
  FlaskConical, 
  BookOpen, 
  Moon, 
  Sun
} from 'lucide-react';

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
    <header className="border-b border-[#E7E1D7] bg-[#FBF4EA]/90 backdrop-blur sticky top-0 z-50 px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 select-none">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between gap-2">
        {/* 1. Brand */}
        <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className="flex items-center gap-2 sm:gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#18181B] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
              <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-[#18181B] text-xs sm:text-sm md:text-base truncate">
                  ConcurrencyLab
                </span>
                <span className="hidden sm:inline-block text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#EFEAE2] text-[#44403C] border border-[#DDD6CB]">
                  C++20
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* 2. Center Navigation Pill Bar */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-[#EFEAE2] p-0.5 sm:p-1 rounded-full border border-[#E2DBD0] shadow-xs flex-shrink-0">
          <button
            onClick={() => setCurrentTab('dashboard')}
            title="Dashboard"
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B] hover:bg-[#E5DFD4]/60'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentTab('workspace')}
            title="Laboratory Workspace"
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'workspace'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B] hover:bg-[#E5DFD4]/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Workspace</span>
          </button>
          <button
            onClick={() => setCurrentTab('docs')}
            title="Architecture & Docs"
            className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentTab === 'docs'
                ? 'bg-[#18181B] text-white shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B] hover:bg-[#E5DFD4]/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-xs">Docs</span>
          </button>
        </nav>

        {/* 3. Right Actions: Engine Status & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Engine Status Pill */}
          <div 
            title={isBackendConnected ? "Connected to native compiled C++ engine" : "Running on C++ scenario cache"}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#EFEAE2] border border-[#DDD6CB] text-[10px] sm:text-[11px] font-medium text-[#44403C]"
          >
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isBackendConnected ? 'bg-[#10B981] animate-pulse' : 'bg-[#18181B]'}`} />
            <span className="hidden md:inline">{isBackendConnected ? 'Live C++ IPC' : 'C++ Engine Cache'}</span>
            <span className="md:hidden text-[10px] font-mono">C++</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title="Toggle Theme"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#DDD6CB] bg-[#FBF4EA] hover:bg-[#EFEAE2] text-[#44403C] hover:text-[#18181B] flex items-center justify-center transition-colors cursor-pointer shadow-xs flex-shrink-0"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
