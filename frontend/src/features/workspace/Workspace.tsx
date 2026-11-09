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
  Zap 
} from 'lucide-react';

export const Workspace: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    getCurrentEvent
  } = useSimulationStore();

  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const currentEvent = getCurrentEvent();

  return (
    <div className="flex flex-col h-[calc(100vh-53px)] bg-[#090D16] text-[#F1F5F9] overflow-hidden">
      {/* Top Toolbar */}
      <TopToolbar />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Central Visualization Stage */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Tab Selector & Diagnostic Pill */}
          <div className="px-4 py-2 border-b border-[#1F2E4D] bg-[#0A0F1D] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                onClick={() => setActiveView('lanes')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'lanes'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#162035]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Thread Lanes
              </button>
              <button
                onClick={() => setActiveView('memory')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'memory'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#162035]'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Shared Memory
              </button>
              <button
                onClick={() => setActiveView('rag')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'rag'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#162035]'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                RAG / Deadlock Graph
              </button>
              <button
                onClick={() => setActiveView('philosophers')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'philosophers'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#162035]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                Dining Philosophers
              </button>
              <button
                onClick={() => setActiveView('buffer')}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeView === 'buffer'
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#162035]'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Bounded Buffer
              </button>
            </div>

            {/* Diagnostic Action Pill */}
            {currentEvent?.raceDetected && (
              <button
                onClick={() => setIsRaceModalOpen(true)}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Zap className="w-3 h-3" />
                Inspect Race Condition Diagnostic
              </button>
            )}
          </div>

          {/* Active Visualizer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeView === 'lanes' && <ThreadLanes />}
            {activeView === 'memory' && <SharedMemoryView />}
            {activeView === 'rag' && <ResourceAllocationGraph />}
            {activeView === 'philosophers' && <DiningTable />}
            {activeView === 'buffer' && <BoundedBuffer />}
          </div>
        </div>

        {/* Right Inspector Panel */}
        <InspectorPanel />
      </div>

      {/* Bottom Timeline Scrubber */}
      <ExecutionTimeline />

      {/* Race Analysis Diagnostic Modal */}
      <RaceAnalysisModal
        isOpen={isRaceModalOpen}
        onClose={() => setIsRaceModalOpen(false)}
      />
    </div>
  );
};
