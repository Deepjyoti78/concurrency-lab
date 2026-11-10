import React, { useState } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { TopToolbar } from './TopToolbar';
import { ThreadLanes } from '../visualization/ThreadLanes';
import { SharedMemoryView } from '../visualization/SharedMemoryView';
import { ResourceAllocationGraph } from '../visualization/ResourceAllocationGraph';
import { DiningTable } from '../visualization/DiningTable';
import { BoundedBuffer } from '../visualization/BoundedBuffer';
import { RaceAnalysisModal } from '../visualization/RaceAnalysisModal';
import { ExecutionTimeline } from './ExecutionTimeline';
import { InspectorPanel } from './InspectorPanel';
import { 
  GitFork, 
  Database, 
  Cpu, 
  Utensils, 
  RefreshCw, 
  Zap,
  SlidersHorizontal,
  Eye
} from 'lucide-react';

export const Workspace: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    getCurrentEvent
  } = useSimulationStore();

  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'stage' | 'inspector'>('stage');
  const currentEvent = getCurrentEvent();

  return (
    <div className="flex flex-col h-[calc(100vh-49px)] sm:h-[calc(100vh-53px)] bg-[#FBF4EA] text-[#171717] overflow-hidden w-full max-w-full">
      {/* 1. Unified Simulation Toolbar */}
      <TopToolbar />

      {/* 2. Main Workspace Layout: Visualizer Canvas + Contextual Inspector */}
      <div className="flex flex-1 overflow-hidden relative min-w-0 w-full">
        {/* Central Visualization Stage */}
        <div className={`flex-1 flex flex-col overflow-hidden min-w-0 ${mobilePane === 'stage' ? 'flex' : 'hidden lg:flex'}`}>
          {/* View Tab Selector Bar */}
          <div className="px-2.5 sm:px-4 py-1.5 border-b border-[#E6E0D6] bg-[#F4EFE7] flex items-center justify-between gap-2 min-w-0 overflow-hidden select-none">
            {/* Visualizer selector segmented bar with touch-friendly scrolling */}
            <div className="flex items-center gap-1 font-mono text-xs bg-[#EFEAE2] p-0.5 rounded border border-[#DDD6CB] overflow-x-auto scrollbar-none flex-nowrap min-w-0 flex-1 sm:flex-initial">
              <button
                onClick={() => setActiveView('lanes')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 text-xs ${
                  activeView === 'lanes'
                    ? 'bg-[#171717] text-white font-bold'
                    : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Thread Lanes</span>
              </button>
              <button
                onClick={() => setActiveView('memory')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 text-xs ${
                  activeView === 'memory'
                    ? 'bg-[#171717] text-white font-bold'
                    : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/60'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Shared Memory</span>
              </button>
              <button
                onClick={() => setActiveView('rag')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 text-xs ${
                  activeView === 'rag'
                    ? 'bg-[#171717] text-white font-bold'
                    : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/60'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>RAG / Deadlock</span>
              </button>
              <button
                onClick={() => setActiveView('philosophers')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 text-xs ${
                  activeView === 'philosophers'
                    ? 'bg-[#171717] text-white font-bold'
                    : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/60'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Dining Table</span>
              </button>
              <button
                onClick={() => setActiveView('buffer')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap flex-shrink-0 text-xs ${
                  activeView === 'buffer'
                    ? 'bg-[#171717] text-white font-bold'
                    : 'text-[#57534E] hover:text-[#171717] hover:bg-[#E6E0D6]/60'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Bounded Buffer</span>
              </button>
            </div>

            {/* Right Diagnostic & Mobile Inspector Toggle */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {currentEvent?.raceDetected && (
                <button
                  onClick={() => setIsRaceModalOpen(true)}
                  className="px-2 py-1 rounded bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#B45309] border border-[#F59E0B]/40 font-mono text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span className="hidden md:inline">Inspect Race</span>
                  <span className="md:hidden">Race</span>
                </button>
              )}

              {/* Mobile Toggle: Switch to Inspector view on small screens */}
              <button
                onClick={() => setMobilePane('inspector')}
                title="Open State Inspector & Registers"
                className="lg:hidden px-2.5 py-1 rounded bg-[#171717] text-white font-mono text-xs font-semibold flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Inspect</span>
              </button>
            </div>
          </div>

          {/* Active Visualizer Body */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 bg-[#FBF4EA] scrollbar-thin min-w-0">
            {activeView === 'lanes' && <ThreadLanes />}
            {activeView === 'memory' && <SharedMemoryView />}
            {activeView === 'rag' && <ResourceAllocationGraph />}
            {activeView === 'philosophers' && <DiningTable />}
            {activeView === 'buffer' && <BoundedBuffer />}
          </div>
        </div>

        {/* Contextual Inspector: 320px on desktop; full screen drawer on mobile */}
        <div className={`flex-col h-full ${
          mobilePane === 'inspector' 
            ? 'flex w-full absolute inset-0 z-20 bg-[#F4EFE7]' 
            : 'hidden lg:flex w-[320px] flex-shrink-0'
        }`}>
          {/* Mobile Back-to-Stage Header */}
          <div className="lg:hidden p-2.5 bg-[#EFEAE2] border-b border-[#DDD6CB] flex items-center justify-between">
            <span className="font-bold text-xs text-[#171717] font-mono">System & Thread Inspector</span>
            <button
              onClick={() => setMobilePane('stage')}
              className="px-2.5 py-1 rounded bg-[#171717] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Back to Visualizer</span>
            </button>
          </div>
          <InspectorPanel />
        </div>
      </div>

      {/* 3. Compact Debugger Execution Timeline */}
      <ExecutionTimeline />

      {/* Race Analysis Diagnostic Modal */}
      <RaceAnalysisModal
        isOpen={isRaceModalOpen}
        onClose={() => setIsRaceModalOpen(false)}
      />
    </div>
  );
};
