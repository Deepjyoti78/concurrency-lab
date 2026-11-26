import React from 'react';
import { useSimulationStore } from '../../store/simulationStore';

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
    <header className="bg-[#F6F4EF]/95 backdrop-blur-xs sticky top-0 z-50 px-4 sm:px-8 lg:px-12 select-none">
      <div className="max-w-[1440px] mx-auto border-b border-[#141413]/25 py-3 flex items-center justify-between gap-3 min-w-0">
        {/* 1. Brand Logo + Technical Divider + Micro Lab Tag */}
        <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0 min-w-0">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 text-left focus:outline-none cursor-pointer group"
          >
            {/* Geometric Isometric Stacked Layers Mark (matching Image 1) */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#141413] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2.5 2.5 7.5 12 12.5 21.5 7.5 12 2.5" />
              <polyline points="2.5 12 12 17 21.5 12" />
              <polyline points="2.5 16.5 12 21.5 21.5 16.5" />
            </svg>
            <span className="font-grotesk font-bold tracking-[-0.02em] text-[#141413] text-sm sm:text-base">
              ConcurrencyLab
            </span>
          </button>

          <span className="hidden md:block w-[1px] h-5 bg-[#141413]/25" />

          <div className="hidden md:flex flex-col font-mono text-[8.5px] leading-[1.2] tracking-[0.1em] text-[#595751] uppercase">
            <span>INTERACTIVE</span>
            <span>COMPUTER SCIENCE LAB</span>
          </div>
        </div>

        {/* 2. Center Microscopic Text Navigation */}
        <nav className="flex items-center gap-4 sm:gap-7 md:gap-9 flex-shrink-0">
          {(['dashboard', 'workspace', 'docs'] as const).map((tab) => {
            const label = tab === 'dashboard' ? 'Home' : tab === 'workspace' ? 'Workspace' : 'Docs';
            const isActive = currentTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`py-1 text-xs sm:text-[13px] font-medium transition-colors cursor-pointer relative ${
                  isActive
                    ? 'text-[#141413] font-semibold'
                    : 'text-[#595751] hover:text-[#141413]'
                }`}
              >
                <span>{label}</span>
                {isActive && (
                  <span className="absolute -bottom-[2px] left-0 right-0 h-[1.5px] bg-[#141413]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 3. Right Telemetry Pill & Contrast Reticle */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 flex-shrink-0">
          <span className="hidden sm:block w-[1px] h-4 bg-[#141413]/25" />

          <div
            title={isBackendConnected ? 'Native C++20 Simulation Core: Connected (Port 3002)' : 'Native C++20 Simulation Core: Cached Engine Run'}
            className="flex items-center gap-1.5 text-[10.5px] font-mono text-[#141413] px-2.5 sm:px-3 py-1 rounded-full border border-[#141413]/70 bg-white/75"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-[#141413]' : 'bg-[#8C8982]'}`} />
            <span className="hidden sm:inline font-medium tracking-wide">C++20 IPC</span>
          </div>

          <span className="hidden sm:block w-[1px] h-4 bg-[#141413]/25" />

          <button
            onClick={toggleTheme}
            title={`Current contrast mode: ${theme}. Click to toggle.`}
            className="w-5 h-5 rounded-full border border-[#141413] flex items-center justify-center transition-transform hover:scale-110 cursor-pointer overflow-hidden"
            aria-label="Toggle contrast mode"
          >
            <div className="w-full h-full flex">
              <div className="w-1/2 h-full bg-[#141413]" />
              <div className="w-1/2 h-full bg-[#F6F4EF]" />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
